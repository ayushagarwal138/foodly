package com.example.demo.config;

import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.service.JwtUtil;
import com.example.demo.security.JwtCookieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private JwtCookieService jwtCookieService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        
        // Skip JWT validation for auth endpoints and health checks
        if (path.startsWith("/auth/login") || path.startsWith("/auth/signup") || path.startsWith("/auth/google")
                || path.startsWith("/oauth2/") || path.startsWith("/login/oauth2/")
                || path.equals("/") || path.equals("/health") || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui") || path.startsWith("/api-docs")) {
            chain.doFilter(request, response);
            return;
        }
        
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            jwt = jwtCookieService.readToken(request).orElse(null);
        }

        if (jwt != null && !jwt.trim().isEmpty() && !"null".equals(jwt) && !"undefined".equals(jwt)) {
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                logger.debug("Invalid JWT on path {}", path);
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (UsernameNotFoundException e) {
                logger.debug("JWT subject no longer maps to an active user");
            } catch (Exception e) {
                logger.warn("Unable to authenticate JWT subject");
            }
        }
        chain.doFilter(request, response);
    }
} 
