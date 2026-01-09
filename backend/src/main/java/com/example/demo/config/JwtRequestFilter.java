package com.example.demo.config;

import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.stream.Collectors;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        System.out.println("JwtRequestFilter path: " + path);
        
        // Skip JWT validation for auth endpoints and health checks
        if (path.startsWith("/auth/") || path.equals("/") || path.equals("/health") || path.startsWith("/actuator/")) {
            System.out.println("Skipping JWT validation for path: " + path);
            chain.doFilter(request, response);
            return;
        }
        
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            // Only try to parse if jwt is not null/empty/"null"/"undefined"
            if (jwt != null && !jwt.trim().isEmpty() && !"null".equals(jwt) && !"undefined".equals(jwt)) {
                try {
                    username = jwtUtil.extractUsername(jwt);
                    System.out.println("Extracted username from token: " + username);
                    String role = jwtUtil.extractRole(jwt);
                    System.out.println("Extracted role from token: " + role);
                } catch (Exception e) {
                    // Optionally log and ignore, do not throw
                    System.out.println("Invalid JWT: " + e.getMessage());
                }
            }
        }
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    // Debug log: print username and authorities
                    System.out.println("Authenticated user: " + userDetails.getUsername());
                    System.out.println("Authorities: " + userDetails.getAuthorities().stream().map(Object::toString).collect(Collectors.joining(", ")));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("JWT token validation failed for user: " + username);
                }
            } catch (UsernameNotFoundException e) {
                System.out.println("User not found or blocked: " + username + " - " + e.getMessage());
                // Don't set authentication, let Spring Security handle the 403/401
            } catch (Exception e) {
                System.out.println("Error loading user details: " + e.getMessage());
                e.printStackTrace();
            }
        } else if (path.startsWith("/api/admin/") || path.startsWith("/api/offers/admin/")) {
            // For admin endpoints, log if no authentication is present
            System.out.println("Admin endpoint accessed without authentication: " + path);
        }
        chain.doFilter(request, response);
    }
} 