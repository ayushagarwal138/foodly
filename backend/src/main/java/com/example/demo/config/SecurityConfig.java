package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.demo.config.JwtRequestFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtRequestFilter jwtRequestFilter;
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/auth/login", "/auth/signup").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/analytics").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/**").permitAll()
                .requestMatchers("/api/support/**").hasAnyRole("CUSTOMER", "RESTAURANT")
                .requestMatchers("/api/cart/**").hasRole("CUSTOMER")
                .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/restaurants/**").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/restaurants/**").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/restaurants/**").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/reviews/**").hasRole("CUSTOMER")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/**").hasAnyRole("CUSTOMER", "RESTAURANT")
                .requestMatchers("/api/orders/**").hasAnyRole("CUSTOMER", "RESTAURANT")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
           .and()
           .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
} 