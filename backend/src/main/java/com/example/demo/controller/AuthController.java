package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.Restaurant;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

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

    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        String email = req.get("email");
        String role = req.get("role");
        
        if (customerRepository.findByUsername(username).isPresent()) {
            return Map.of("error", "Username already exists");
        }
        
        User customer = new User();
        customer.setUsername(username);
        customer.setPassword(passwordEncoder.encode(password));
        customer.setEmail(email);
        customer.setRole(role.toUpperCase());
        customer = customerRepository.save(customer);
        
        // If registering as restaurant, create restaurant entity
        if ("RESTAURANT".equals(role.toUpperCase())) {
            Restaurant restaurant = new Restaurant();
            restaurant.setName(req.get("restaurantName"));
            restaurant.setAddress(req.get("restaurantAddress"));
            restaurant.setPhone(req.get("restaurantPhone"));
            restaurant.setCuisineType(req.get("cuisineType"));
            restaurant.setDescription(req.get("description"));
            restaurant.setOpeningHours(req.get("openingHours"));
            restaurant.setIsActive(true);
            restaurant.setOwner(customer);
            restaurantRepository.save(restaurant);
        }
        return Map.of("message", "Signup successful", "id", customer.getId());
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        String role = req.get("role");
        
        System.out.println("=== Login Attempt ===");
        System.out.println("Username/Email: " + username);
        System.out.println("Requested Role: " + role);
        
        // Try to find user by username first, then by email
        Optional<User> customerOpt = customerRepository.findByUsername(username);
        if (customerOpt.isEmpty()) {
            // Try email if username lookup fails
            customerOpt = customerRepository.findByEmail(username);
            System.out.println("Username lookup failed, trying email lookup");
        }
        
        if (customerOpt.isEmpty()) {
            System.out.println("User not found: " + username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid credentials"));
        }
        
        User customer = customerOpt.get();
        System.out.println("User found: " + customer.getUsername() + " (ID: " + customer.getId() + ")");
        System.out.println("User role in DB: " + customer.getRole());
        System.out.println("Requested role: " + role);
        
        // Check if user is blocked
        if (customer.getIsBlocked() != null && customer.getIsBlocked()) {
            System.out.println("User is blocked");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Your account has been blocked. Please contact support."));
        }
        
        // Check role match (case-insensitive)
        if (customer.getRole() == null || !customer.getRole().equalsIgnoreCase(role)) {
            System.out.println("Role mismatch - DB: " + customer.getRole() + ", Requested: " + role);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Role mismatch. Please select the correct role."));
        }
        
        // Check password
        boolean passwordMatches = passwordEncoder.matches(password, customer.getPassword());
        System.out.println("Password match: " + passwordMatches);
        if (!passwordMatches) {
            System.out.println("Invalid password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid credentials"));
        }
        // Ensure role is uppercase for JWT token
        String customerRole = customer.getRole() != null ? customer.getRole().toUpperCase() : "CUSTOMER";
        String token = jwtUtil.generateToken(customer.getUsername(), customerRole);
        
        if ("RESTAURANT".equalsIgnoreCase(customerRole)) {
            Optional<Restaurant> restaurant = restaurantRepository.findByOwner_Id(customer.getId());
            if (restaurant.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "id", customer.getId(),
                    "restaurantId", restaurant.get().getId()
                ));
            } else {
                // Still return token even if restaurant not found, but log a warning
                System.out.println("Warning: Restaurant user " + customer.getUsername() + " has no associated restaurant");
                return ResponseEntity.ok(Map.of("token", token, "id", customer.getId()));
            }
        }
        return ResponseEntity.ok(Map.of("token", token, "id", customer.getId()));
    }
} 