package com.example.demo.controller;

import com.example.demo.model.Cart;
import com.example.demo.model.User;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public Map<String, Object> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<Cart> cartItems = cartRepository.findByCustomerId(customer.getId());
        
        // Convert to frontend expected format
        List<Map<String, Object>> items = cartItems.stream()
            .map(item -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("name", item.getName());
                map.put("price", item.getPrice());
                map.put("qty", item.getQuantity());
                map.put("restaurantId", item.getRestaurantId());
                map.put("menu_item_id", item.getMenuItemId()); // <-- Ensure this is included
                return map;
            })
            .toList();
        
        return Map.of(
            "items", items,
            "address", cartItems.isEmpty() ? "" : cartItems.get(0).getAddress()
        );
    }

    @PutMapping
    @Transactional
    public Map<String, Object> updateCart(@RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        // Clear existing cart
        cartRepository.deleteByCustomerId(customer.getId());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
        String address = (String) request.get("address");
        if (items != null) {
            for (Map<String, Object> item : items) {
                Cart cartItem = new Cart();
                cartItem.setCustomer(customer);
                cartItem.setName((String) item.get("name"));
                cartItem.setPrice(Double.valueOf(item.get("price").toString()));
                cartItem.setQuantity(Integer.valueOf(item.get("qty").toString()));
                Object menuItemIdObj = item.get("menu_item_id");
                if (menuItemIdObj == null) {
                    throw new IllegalArgumentException("menu_item_id is required in cart item");
                }
                cartItem.setMenuItemId(Long.valueOf(menuItemIdObj.toString()));
                Object restaurantIdObj = item.get("restaurantId");
                if (restaurantIdObj == null) {
                    throw new IllegalArgumentException("restaurantId is required in cart item");
                }
                cartItem.setRestaurantId(Long.valueOf(restaurantIdObj.toString()));
                cartItem.setAddress(address);
                cartRepository.save(cartItem);
            }
        }
        // Return updated cart (same as getCart)
        List<Cart> cartItems = cartRepository.findByCustomerId(customer.getId());
        List<Map<String, Object>> responseItems = cartItems.stream()
            .map(item -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("name", item.getName());
                map.put("price", item.getPrice());
                map.put("qty", item.getQuantity());
                map.put("menu_item_id", item.getMenuItemId());
                map.put("restaurantId", item.getRestaurantId());
                return map;
            })
            .toList();
        return Map.of(
            "items", responseItems,
            "address", cartItems.isEmpty() ? "" : cartItems.get(0).getAddress()
        );
    }

    @DeleteMapping
    public void clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        cartRepository.deleteByCustomerId(customer.getId());
    }
} 