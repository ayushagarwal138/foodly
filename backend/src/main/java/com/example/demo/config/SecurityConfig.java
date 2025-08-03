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
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.Arrays;
import com.example.demo.config.JwtRequestFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {
    @Autowired
    private JwtRequestFilter jwtRequestFilter;
    
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = allowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
        }
        
        registry.addMapping("/**")
            .allowedOrigins(origins)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", 
                          "Access-Control-Request-Method", "Access-Control-Request-Headers")
            .allowCredentials(true)
            .maxAge(3600);
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers("/", "/health", "/actuator/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/slug/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/menu/customer").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/reviews").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/analytics").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/orders").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/menu").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/by-owner/**").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*").permitAll()
                .requestMatchers("/api/support/**").hasAnyRole("CUSTOMER", "RESTAURANT")
                .requestMatchers("/api/cart/**").hasRole("CUSTOMER")
                .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/restaurants/**").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/restaurants/**").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/restaurants/**").hasRole("RESTAURANT")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/reviews/**").hasRole("CUSTOMER")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/restaurant/**").permitAll()
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
        
        // Parse allowed origins from property
        String[] origins = allowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim(); // Remove any whitespace
        }
        
        System.out.println("=== CORS Configuration Debug ===");
        System.out.println("Raw allowed origins: " + allowedOrigins);
        System.out.println("Parsed origins: " + Arrays.toString(origins));
        
        configuration.setAllowedOrigins(Arrays.asList(origins));
        
        // Allow all common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allow specific headers instead of wildcard
        configuration.setAllowedHeaders(Arrays.asList(
            "Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", 
            "Access-Control-Request-Method", "Access-Control-Request-Headers"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Set max age for preflight requests
        configuration.setMaxAge(3600L);
        
        // Add exposed headers
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        System.out.println("CORS configuration created successfully");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 