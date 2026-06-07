package com.example.demo.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class SimpleRateLimitFilter extends OncePerRequestFilter {
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${app.rate-limit.window-seconds:60}")
    private long windowSeconds;

    @Value("${app.rate-limit.auth-limit:10}")
    private int authLimit;

    @Value("${app.rate-limit.mutation-limit:120}")
    private int mutationLimit;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (!enabled || "GET".equalsIgnoreCase(request.getMethod())
                || "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !isSensitivePath(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        int limit = isAuthPath(request.getRequestURI()) ? authLimit : mutationLimit;
        String key = clientKey(request) + ":" + request.getRequestURI();
        Window window = windows.compute(key, (ignored, existing) -> {
            long now = Instant.now().getEpochSecond();
            if (existing == null || now >= existing.resetAtEpochSecond) {
                return new Window(now + windowSeconds);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (window.count.get() > limit) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":{\"code\":\"RATE_LIMITED\",\"message\":\"Too many requests\",\"details\":[]},\"requestId\":\""
                    + request.getAttribute("requestId") + "\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isSensitivePath(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/auth/")
                || path.startsWith("/api/v1/auth/")
                || path.startsWith("/api/orders")
                || path.startsWith("/api/v1/orders")
                || path.startsWith("/api/reviews")
                || path.startsWith("/api/v1/reviews")
                || path.startsWith("/api/support")
                || path.startsWith("/api/v1/support")
                || path.startsWith("/api/offers/validate")
                || path.startsWith("/api/v1/offers/validate")
                || path.startsWith("/api/admin");
    }

    private boolean isAuthPath(String path) {
        return path.startsWith("/auth/") || path.startsWith("/api/v1/auth/");
    }

    private String clientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class Window {
        private final long resetAtEpochSecond;
        private final AtomicInteger count = new AtomicInteger(1);

        private Window(long resetAtEpochSecond) {
            this.resetAtEpochSecond = resetAtEpochSecond;
        }
    }
}
