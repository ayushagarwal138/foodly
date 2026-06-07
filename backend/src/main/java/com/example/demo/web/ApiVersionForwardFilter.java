package com.example.demo.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ApiVersionForwardFilter extends OncePerRequestFilter {
    private static final String VERSION_PREFIX = "/api/v1";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path.startsWith(VERSION_PREFIX + "/auth/")) {
            forward(request, response, "/auth/" + path.substring((VERSION_PREFIX + "/auth/").length()));
            return;
        }
        if (path.equals(VERSION_PREFIX + "/auth")) {
            forward(request, response, "/auth");
            return;
        }
        if (path.startsWith(VERSION_PREFIX + "/")) {
            forward(request, response, "/api/" + path.substring((VERSION_PREFIX + "/").length()));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private void forward(HttpServletRequest request, HttpServletResponse response, String target)
            throws ServletException, IOException {
        request.getRequestDispatcher(target).forward(request, response);
    }
}
