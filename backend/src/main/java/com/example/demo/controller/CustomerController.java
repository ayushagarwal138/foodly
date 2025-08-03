package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.Wishlist;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private WishlistRepository wishlistRepository;

    @GetMapping
    public List<User> getAllCustomers() {
        return customerRepository.findAll();
    }

    @GetMapping("/{id}")
    public User getCustomerById(@PathVariable Long id, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        System.out.println("=== Customer Profile Debug ===");
        System.out.println("Requested user ID: " + id);
        System.out.println("Principal: " + (principal != null ? principal.getUsername() : "NULL"));
        
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("Found user: " + user.getUsername());
        System.out.println("User ID match: " + user.getUsername().equals(principal.getUsername()));
        
        if (!user.getUsername().equals(principal.getUsername())) {
            System.out.println("ERROR: Username mismatch. User: " + user.getUsername() + ", Principal: " + principal.getUsername());
            throw new AccessDeniedException("Forbidden");
        }
        
        System.out.println("Profile access granted");
        return user;
    }

    @GetMapping("/{id}/favorites")
    public Map<String, Object> getFavorites(@PathVariable Long id, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        
        List<Wishlist> wishlistItems = wishlistRepository.findByCustomerId(id);
        
        // Remove duplicates by using a Map to keep only unique items
        Map<String, Map<String, Object>> uniqueRestaurants = new HashMap<>();
        Map<String, Map<String, Object>> uniqueDishes = new HashMap<>();
        
        for (Wishlist item : wishlistItems) {
            if ("RESTAURANT".equals(item.getType())) {
                String key = item.getName() + "_" + item.getRestaurantId();
                if (!uniqueRestaurants.containsKey(key)) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", item.getName());
                    map.put("restaurant", item.getName());
                    map.put("restaurantId", item.getRestaurantId());
                    uniqueRestaurants.put(key, map);
                }
            } else if ("DISH".equals(item.getType())) {
                String key = item.getName() + "_" + item.getRestaurantId() + "_" + item.getMenuItemId();
                if (!uniqueDishes.containsKey(key)) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", item.getName());
                    map.put("restaurant", item.getRestaurant());
                    map.put("restaurantId", item.getRestaurantId());
                    map.put("menuItemId", item.getMenuItemId());
                    uniqueDishes.put(key, map);
                }
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("restaurants", new ArrayList<>(uniqueRestaurants.values()));
        result.put("dishes", new ArrayList<>(uniqueDishes.values()));
        return result;
    }

    @GetMapping("/{id}/wishlist")
    public List<Wishlist> getWishlist(@PathVariable Long id, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        return wishlistRepository.findByCustomerId(id);
    }

    @PostMapping("/{id}/wishlist")
    public ResponseEntity<?> addToWishlist(@PathVariable Long id, @RequestBody Map<String, Object> request, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        
        String type = (String) request.get("type");
        String name = (String) request.get("name");
        String restaurant = (String) request.get("restaurant");
        Long restaurantId = request.get("restaurantId") != null ? Long.valueOf(request.get("restaurantId").toString()) : null;
        Long menuItemId = request.get("menuItemId") != null ? Long.valueOf(request.get("menuItemId").toString()) : null;
        
        // Check for duplicates
        boolean isDuplicate = false;
        if ("RESTAURANT".equals(type)) {
            isDuplicate = wishlistRepository.existsByCustomerIdAndTypeAndNameAndRestaurantId(id, type, name, restaurantId);
        } else if ("DISH".equals(type)) {
            isDuplicate = wishlistRepository.existsByCustomerIdAndTypeAndNameAndRestaurantIdAndMenuItemId(id, type, name, restaurantId, menuItemId);
        }
        
        if (isDuplicate) {
            return ResponseEntity.status(409).body("Item is already in your favorites");
        }
        
        Wishlist wishlist = new Wishlist();
        wishlist.setCustomer(user);
        wishlist.setType(type);
        wishlist.setName(name);
        wishlist.setRestaurant(restaurant);
        wishlist.setRestaurantId(restaurantId);
        wishlist.setMenuItemId(menuItemId);
        
        Wishlist saved = wishlistRepository.save(wishlist);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}/wishlist")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long id, @RequestBody Map<String, Object> request, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        
        String type = (String) request.get("type");
        String name = (String) request.get("name");
        String restaurant = (String) request.get("restaurant");
        Long restaurantId = request.get("restaurantId") != null ? Long.valueOf(request.get("restaurantId").toString()) : null;
        Long menuItemId = request.get("menuItemId") != null ? Long.valueOf(request.get("menuItemId").toString()) : null;
        
        Wishlist wishlistItem = null;
        if ("RESTAURANT".equals(type)) {
            wishlistItem = wishlistRepository.findByCustomerIdAndTypeAndNameAndRestaurantId(id, type, name, restaurantId);
        } else if ("DISH".equals(type)) {
            wishlistItem = wishlistRepository.findByCustomerIdAndTypeAndNameAndRestaurantIdAndMenuItemId(id, type, name, restaurantId, menuItemId);
        }
        
        if (wishlistItem != null) {
            wishlistRepository.delete(wishlistItem);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(404).body("Favorite item not found");
        }
    }

    @PostMapping
    public User createCustomer(@RequestBody User customer) {
        return customerRepository.save(customer);
    }

    @PutMapping("/{id}")
    public User updateCustomer(@PathVariable Long id, @RequestBody User customerDetails) {
        User customer = customerRepository.findById(id).orElseThrow();
        customer.setUsername(customerDetails.getUsername());
        customer.setPassword(customerDetails.getPassword());
        customer.setEmail(customerDetails.getEmail());
        customer.setRole(customerDetails.getRole());
        return customerRepository.save(customer);
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable Long id) {
        customerRepository.deleteById(id);
    }
} 