package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
import com.example.demo.security.GoogleOAuth2SuccessHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig implements WebMvcConfigurer {
    @Autowired
    private JwtRequestFilter jwtRequestFilter;
    @Autowired
    private GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    
    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Value("${app.oauth2.google.enabled:false}")
    private boolean googleOAuthEnabled;
    
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
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/slug/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/menu/customer").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/reviews").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/analytics").hasAnyRole("RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/orders").hasAnyRole("RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*/menu").hasAnyRole("RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/by-owner/**").hasAnyRole("RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/restaurants/*").permitAll()
                .requestMatchers("/api/support/**").hasAnyRole("CUSTOMER", "RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers("/api/cart/**").hasRole("CUSTOMER")
                .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/restaurants/**").hasAnyRole("RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/restaurants/**").hasAnyRole("RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/restaurants/**").hasAnyRole("RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/reviews/**").hasRole("CUSTOMER")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/restaurant/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/**").hasAnyRole("CUSTOMER", "RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers("/api/orders/**").hasAnyRole("CUSTOMER", "RESTAURANT", "RESTAURANT_OWNER")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/offers/admin/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/offers/**").permitAll()
                .anyRequest().authenticated()
           .and()
           .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        if (googleOAuthEnabled) {
            http.oauth2Login(oauth -> oauth.successHandler(googleOAuth2SuccessHandler));
        }

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        String[] origins = allowedOrigins.split(",");
        for (int i = 0; i < origins.length; i++) {
            origins[i] = origins[i].trim();
            if ("*".equals(origins[i])) {
                throw new IllegalStateException("Wildcard CORS origins are not allowed when credentials are enabled");
            }
        }

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
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 
