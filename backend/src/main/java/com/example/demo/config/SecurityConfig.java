package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import java.util.Arrays;
import com.example.demo.config.JwtRequestFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtRequestFilter jwtRequestFilter;
    
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/", "/health", "/actuator/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
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
                .requestMatchers("/api/offers/admin/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/offers/**").permitAll()
                .anyRequest().authenticated()
           .and()
           .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 