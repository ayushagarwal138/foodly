package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.Restaurant;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
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
    public Map<String, Object> login(@RequestBody Map<String, String> req) {
        String username = req.get("username");
        String password = req.get("password");
        String role = req.get("role");
        Optional<User> customerOpt = customerRepository.findByUsername(username);
        if (customerOpt.isEmpty()) {
            return Map.of("error", "Invalid credentials");
        }
        User customer = customerOpt.get();
        if (!customer.getRole().equalsIgnoreCase(role)) {
            return Map.of("error", "Role mismatch");
        }
        if (!passwordEncoder.matches(password, customer.getPassword())) {
            return Map.of("error", "Invalid credentials");
        }
        String token = jwtUtil.generateToken(customer.getUsername(), customer.getRole());
        
        if ("RESTAURANT".equalsIgnoreCase(customer.getRole())) {
            Optional<Restaurant> restaurant = restaurantRepository.findAll().stream()
                .filter(r -> r.getOwner() != null && r.getOwner().getId().equals(customer.getId()))
                .findFirst();
            if (restaurant.isPresent()) {
                return Map.of(
                    "token", token,
                    "id", customer.getId(),
                    "restaurantId", restaurant.get().getId()
                );
            }
        }
        return Map.of("token", token, "id", customer.getId());
    }
} 