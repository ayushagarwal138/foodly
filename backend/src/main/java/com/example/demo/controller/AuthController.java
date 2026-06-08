package com.example.demo.controller;

import com.example.demo.dto.AuthUserResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.SignupRequest;
import com.example.demo.model.User;
import com.example.demo.model.Restaurant;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.security.JwtCookieService;
import com.example.demo.service.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;
import java.text.Normalizer;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private JwtCookieService jwtCookieService;

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest req) {
        String username = req.getUsername().trim();
        String email = req.getEmail().trim().toLowerCase();
        String role = normalizeRole(req.getRole());

        if ("ADMIN".equals(role)) {
            throw new ApiException("ROLE_NOT_ALLOWED", "Admin accounts cannot be created through public signup", HttpStatus.FORBIDDEN);
        }
        
        if (customerRepository.findByUsername(username).isPresent()) {
            throw new ApiException("USERNAME_EXISTS", "Username already exists", HttpStatus.CONFLICT);
        }
        if (customerRepository.findByEmail(email).isPresent()) {
            throw new ApiException("EMAIL_EXISTS", "Email already exists", HttpStatus.CONFLICT);
        }
        
        User customer = new User();
        customer.setUsername(username);
        customer.setPassword(passwordEncoder.encode(req.getPassword()));
        customer.setEmail(email);
        customer.setRole(role);
        customer.setProvider("LOCAL");
        customer.setEmailVerified(false);
        customer = customerRepository.save(customer);
        Long restaurantId = null;
        
        // If registering as restaurant, create restaurant entity
        if ("RESTAURANT".equals(role) || "RESTAURANT_OWNER".equals(role)) {
            Restaurant restaurant = new Restaurant();
            restaurant.setName(req.getRestaurantName());
            restaurant.setAddress(req.getRestaurantAddress());
            restaurant.setPhone(req.getRestaurantPhone());
            restaurant.setCuisineType(req.getCuisineType());
            restaurant.setDescription(req.getDescription());
            restaurant.setOpeningHours(req.getOpeningHours());
            restaurant.setIsActive(true);
            restaurant.setSlug(generateUniqueSlug(req.getRestaurantName()));
            restaurant.setOwner(customer);
            restaurantId = restaurantRepository.save(restaurant).getId();
        }

        String responseRole = frontendRole(customer.getRole());
        String token = jwtUtil.generateToken(customer.getUsername(), customer.getRole());
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("message", "Signup successful");
        body.put("id", customer.getId());
        body.put("username", customer.getUsername());
        body.put("email", customer.getEmail());
        body.put("role", responseRole);
        if (restaurantId != null) {
            body.put("restaurantId", restaurantId);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.createTokenCookie(token).toString())
                .body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest req) {
        String username = req.getUsername().trim();
        String password = req.getPassword();
        String role = normalizeRole(req.getRole());
        
        // Try to find user by username first, then by email
        Optional<User> customerOpt = customerRepository.findByUsername(username);
        if (customerOpt.isEmpty()) {
            // Try email if username lookup fails
            customerOpt = customerRepository.findByEmail(username.toLowerCase());
        }
        
        if (customerOpt.isEmpty()) {
            throw new ApiException("INVALID_CREDENTIALS", "Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
        
        User customer = customerOpt.get();
        
        // Check if user is blocked
        if (customer.getIsBlocked() != null && customer.getIsBlocked()) {
            throw new ApiException("ACCOUNT_BLOCKED", "Your account has been blocked. Please contact support.", HttpStatus.FORBIDDEN);
        }
        
        // Check role match (case-insensitive)
        if (!rolesMatch(customer.getRole(), role)) {
            throw new ApiException("ROLE_MISMATCH", "Role mismatch. Please select the correct role.", HttpStatus.UNAUTHORIZED);
        }
        
        // Check password
        if (customer.getPassword() == null || customer.getPassword().isBlank()) {
            throw new ApiException("OAUTH_ACCOUNT", "Please sign in with Google for this account.", HttpStatus.UNAUTHORIZED);
        }
        boolean passwordMatches = passwordEncoder.matches(password, customer.getPassword());
        if (!passwordMatches) {
            throw new ApiException("INVALID_CREDENTIALS", "Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
        // Ensure role is uppercase for JWT token
        String customerRole = customer.getRole() != null ? customer.getRole().toUpperCase() : "CUSTOMER";
        String responseRole = frontendRole(customerRole);
        String token = jwtUtil.generateToken(customer.getUsername(), customerRole);
        
        ResponseEntity.BodyBuilder response = ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.createTokenCookie(token).toString());

        if ("RESTAURANT".equalsIgnoreCase(responseRole)) {
            Optional<Restaurant> restaurant = restaurantRepository.findByOwner_Id(customer.getId());
            if (restaurant.isPresent()) {
                return response.body(Map.of(
                    "id", customer.getId(),
                    "role", responseRole,
                    "restaurantId", restaurant.get().getId()
                ));
            } else {
                return response.body(Map.of("id", customer.getId(), "role", responseRole));
            }
        }
        return response.body(Map.of("id", customer.getId(), "role", responseRole));
    }

    @GetMapping("/google")
    public RedirectView googleLogin() {
        return new RedirectView("/oauth2/authorization/google");
    }

    @GetMapping("/me")
    public AuthUserResponse me(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new ApiException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        User user = customerRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
        Long restaurantId = restaurantRepository.findByOwner_Id(user.getId()).map(Restaurant::getId).orElse(null);
        return new AuthUserResponse(user.getId(), user.getUsername(), user.getEmail(), frontendRole(user.getRole()), restaurantId);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookieService.clearTokenCookie().toString());
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    private String normalizeRole(String rawRole) {
        String role = rawRole == null ? "CUSTOMER" : rawRole.trim().toUpperCase();
        if ("RESTAURANT_OWNER".equals(role)) {
            return "RESTAURANT";
        }
        return role;
    }

    private boolean rolesMatch(String storedRole, String requestedRole) {
        return normalizeRole(storedRole).equals(normalizeRole(requestedRole));
    }

    private String frontendRole(String storedRole) {
        return normalizeRole(storedRole);
    }

    private String generateUniqueSlug(String name) {
        String baseSlug = slugify(name);
        String uniqueSlug = baseSlug;
        int count = 1;
        while (restaurantRepository.findBySlug(uniqueSlug).isPresent()) {
            uniqueSlug = baseSlug + "-" + count;
            count++;
        }
        return uniqueSlug;
    }

    private String slugify(String input) {
        String safeInput = input == null || input.isBlank() ? "restaurant" : input.trim();
        String nowhitespace = Pattern.compile("\\s+").matcher(safeInput).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^a-zA-Z0-9-]").matcher(normalized).replaceAll("");
        slug = slug.toLowerCase();
        return slug.isBlank() ? "restaurant" : slug;
    }
}
