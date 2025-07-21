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

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
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
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        return user;
    }

    @GetMapping("/{id}/favorites")
    public Map<String, Object> getFavorites(@PathVariable Long id, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        
        List<Wishlist> wishlistItems = wishlistRepository.findByCustomerId(id);
        
        List<Map<String, Object>> restaurants = wishlistItems.stream()
            .filter(item -> "RESTAURANT".equals(item.getType()))
            .map(item -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", item.getName());
                map.put("restaurant", item.getName());
                return map;
            })
            .toList();
            
        List<Map<String, Object>> dishes = wishlistItems.stream()
            .filter(item -> "DISH".equals(item.getType()))
            .map(item -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", item.getName());
                map.put("restaurant", item.getRestaurant());
                return map;
            })
            .toList();
        
        Map<String, Object> result = new HashMap<>();
        result.put("restaurants", restaurants);
        result.put("dishes", dishes);
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
    public Wishlist addToWishlist(@PathVariable Long id, @RequestBody Map<String, Object> request, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        Wishlist wishlist = new Wishlist();
        wishlist.setCustomer(user);
        wishlist.setType((String) request.get("type"));
        wishlist.setName((String) request.get("name"));
        wishlist.setRestaurant((String) request.get("restaurant"));
        if (request.get("restaurantId") != null) wishlist.setRestaurantId(Long.valueOf(request.get("restaurantId").toString()));
        if (request.get("menuItemId") != null) wishlist.setMenuItemId(Long.valueOf(request.get("menuItemId").toString()));
        return wishlistRepository.save(wishlist);
    }

    @DeleteMapping("/{id}/wishlist")
    public void removeFromWishlist(@PathVariable Long id, @RequestBody Map<String, Object> request, @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = customerRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getUsername().equals(principal.getUsername())) {
            throw new AccessDeniedException("Forbidden");
        }
        
        String type = (String) request.get("type");
        String name = (String) request.get("name");
        String restaurant = (String) request.get("restaurant");
        
        wishlistRepository.deleteByCustomerIdAndTypeAndNameAndRestaurant(id, type, name, restaurant);
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