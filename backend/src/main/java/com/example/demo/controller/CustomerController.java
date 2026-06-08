package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.Wishlist;
import com.example.demo.exception.ApiException;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
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
    public List<Map<String, Object>> getAllCustomers(@AuthenticationPrincipal UserDetails principal) {
        User requester = authenticatedUser(principal);
        if (!"ADMIN".equals(requester.getRole())) {
            throw new AccessDeniedException("Forbidden");
        }
        return customerRepository.findAll().stream()
            .map(this::toSafeUserDto)
            .toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getCustomerById(@PathVariable Long id, @AuthenticationPrincipal UserDetails principal) {
        User user = requireSelf(id, principal);
        return toSafeUserDto(user);
    }

    @GetMapping("/{id}/favorites")
    public Map<String, Object> getFavorites(@PathVariable Long id, @AuthenticationPrincipal UserDetails principal) {
        requireSelf(id, principal);
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
    public List<Wishlist> getWishlist(@PathVariable Long id, @AuthenticationPrincipal UserDetails principal) {
        requireSelf(id, principal);
        return wishlistRepository.findByCustomerId(id);
    }

    @PostMapping("/{id}/wishlist")
    public ResponseEntity<?> addToWishlist(@PathVariable Long id, @RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails principal) {
        User user = requireSelf(id, principal);
        
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
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long id, @RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails principal) {
        requireSelf(id, principal);
        
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
    public void createCustomer() {
        throw new AccessDeniedException("Customer creation is only available through signup or admin management");
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateCustomer(@PathVariable Long id, @RequestBody Map<String, Object> customerDetails,
                                              @AuthenticationPrincipal UserDetails principal) {
        User customer = requireSelf(id, principal);
        String username = stringValue(customerDetails.get("username"));
        if (username == null) {
            username = stringValue(customerDetails.get("name"));
        }
        String email = stringValue(customerDetails.get("email"));

        if (username != null && !username.isBlank()) {
            customer.setUsername(username.trim());
        }
        if (email != null && !email.isBlank()) {
            customer.setEmail(email.trim().toLowerCase());
        }
        return toSafeUserDto(customerRepository.save(customer));
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable Long id, @AuthenticationPrincipal UserDetails principal) {
        requireSelf(id, principal);
        throw new AccessDeniedException("Customer deletion is only available through admin management");
    }

    private User requireSelf(Long requestedId, UserDetails principal) {
        User authenticated = authenticatedUser(principal);
        if (!authenticated.getId().equals(requestedId)) {
            throw new AccessDeniedException("Forbidden");
        }
        return authenticated;
    }

    private User authenticatedUser(UserDetails principal) {
        if (principal == null) {
            throw new ApiException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        return customerRepository.findByUsername(principal.getUsername())
            .orElseThrow(() -> new ApiException("USER_NOT_FOUND", "User not found", HttpStatus.NOT_FOUND));
    }

    private Map<String, Object> toSafeUserDto(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("username", user.getUsername());
        dto.put("name", user.getUsername());
        dto.put("email", user.getEmail());
        dto.put("role", user.getRole());
        dto.put("isBlocked", Boolean.TRUE.equals(user.getIsBlocked()));
        return dto;
    }

    private String stringValue(Object value) {
        return value instanceof String string ? string : null;
    }
} 
