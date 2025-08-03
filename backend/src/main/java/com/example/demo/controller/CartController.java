package com.example.demo.controller;

import com.example.demo.model.Cart;
import com.example.demo.model.MenuItem;
import com.example.demo.model.User;
import com.example.demo.repository.CartRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;

    @GetMapping
    public Map<String, Object> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<Cart> cartItems = cartRepository.findByCustomerId(customer.getId());
        
        // Convert to frontend expected format
        List<Map<String, Object>> items = cartItems.stream()
            .map(item -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("name", item.getMenuItem().getName());
                map.put("price", item.getMenuItem().getPrice());
                map.put("qty", item.getQuantity());
                map.put("restaurantId", item.getMenuItem().getRestaurant().getId());
                map.put("menu_item_id", item.getMenuItem().getId());
                return map;
            })
            .toList();
        
        return Map.of(
            "items", items,
            "address", "" // Cart doesn't store address in database
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
        if (items != null) {
            for (Map<String, Object> item : items) {
                Object menuItemIdObj = item.get("menu_item_id");
                if (menuItemIdObj == null) {
                    throw new IllegalArgumentException("menu_item_id is required in cart item");
                }
                Long menuItemId = Long.valueOf(menuItemIdObj.toString());
                
                // Check availability and quantity
                MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(() -> 
                    new IllegalArgumentException("Menu item not found"));
                
                if (!menuItem.getIsAvailable()) {
                    throw new IllegalArgumentException("Menu item '" + menuItem.getName() + "' is not available");
                }
                
                if (menuItem.getShowQuantity() && menuItem.getQuantityAvailable() != null) {
                    int requestedQty = Integer.valueOf(item.get("qty").toString());
                    if (requestedQty > menuItem.getQuantityAvailable()) {
                        throw new IllegalArgumentException("Insufficient quantity for '" + menuItem.getName() + "'. Available: " + menuItem.getQuantityAvailable());
                    }
                    // Decrement the available quantity
                    menuItem.setQuantityAvailable(menuItem.getQuantityAvailable() - requestedQty);
                    menuItemRepository.save(menuItem);
                }
                
                Cart cartItem = new Cart();
                cartItem.setCustomer(customer);
                cartItem.setMenuItem(menuItem);
                cartItem.setQuantity(Integer.valueOf(item.get("qty").toString()));
                cartRepository.save(cartItem);
            }
        }
        // Return updated cart (same as getCart)
        return getCart(userDetails);
    }

    @DeleteMapping
    public void clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        cartRepository.deleteByCustomerId(customer.getId());
    }
} 