package com.example.demo.security;

import com.example.demo.model.User;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.service.JwtUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final CustomerRepository customerRepository;
    private final JwtUtil jwtUtil;
    private final JwtCookieService jwtCookieService;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:3000/auth/callback}")
    private String authorizedRedirectUri;

    public GoogleOAuth2SuccessHandler(CustomerRepository customerRepository, JwtUtil jwtUtil, JwtCookieService jwtCookieService) {
        this.customerRepository = customerRepository;
        this.jwtUtil = jwtUtil;
        this.jwtCookieService = jwtCookieService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String providerSubject = oauthUser.getAttribute("sub");
        String email = oauthUser.getAttribute("email");
        Boolean emailVerified = oauthUser.getAttribute("email_verified");
        String name = oauthUser.getAttribute("name");

        if (email == null || email.isBlank() || Boolean.FALSE.equals(emailVerified)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Google account email must be verified");
            return;
        }

        User user = customerRepository.findByProviderAndProviderSubject("GOOGLE", providerSubject)
                .or(() -> customerRepository.findByEmail(email.toLowerCase()))
                .map(existing -> updateGoogleIdentity(existing, providerSubject, emailVerified))
                .orElseGet(() -> createGoogleUser(providerSubject, email, name, emailVerified));

        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account is blocked");
            return;
        }

        user.setLastLoginAt(LocalDateTime.now());
        customerRepository.save(user);

        String role = user.getRole() != null ? user.getRole().toUpperCase() : "CUSTOMER";
        String token = jwtUtil.generateToken(user.getUsername(), role);
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookieService.createTokenCookie(token).toString());
        response.sendRedirect(authorizedRedirectUri + "?login=success");
    }

    private User updateGoogleIdentity(User user, String providerSubject, Boolean emailVerified) {
        user.setProvider("GOOGLE");
        user.setProviderSubject(providerSubject);
        user.setEmailVerified(Boolean.TRUE.equals(emailVerified));
        return user;
    }

    private User createGoogleUser(String providerSubject, String email, String name, Boolean emailVerified) {
        User user = new User();
        user.setUsername(uniqueUsername(name, email));
        user.setEmail(email.toLowerCase());
        user.setRole("CUSTOMER");
        user.setProvider("GOOGLE");
        user.setProviderSubject(providerSubject);
        user.setEmailVerified(Boolean.TRUE.equals(emailVerified));
        user.setIsBlocked(false);
        return user;
    }

    private String uniqueUsername(String name, String email) {
        String base = (name != null && !name.isBlank() ? name : email.substring(0, email.indexOf("@")))
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_|_$", "");
        if (base.isBlank()) {
            base = "google_user";
        }

        String candidate = base;
        int suffix = 1;
        while (customerRepository.findByUsername(candidate).isPresent()) {
            candidate = base + "_" + suffix++;
        }
        return candidate;
    }
}
