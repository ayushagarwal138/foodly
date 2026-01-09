package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.Restaurant;
import com.example.demo.model.Order;
import com.example.demo.model.Review;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return customerRepository.findAll().stream().map(user -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", user.getId());
            dto.put("username", user.getUsername());
            dto.put("email", user.getEmail());
            dto.put("role", user.getRole());
            dto.put("isBlocked", user.getIsBlocked() != null ? user.getIsBlocked() : false);
            // Note: createdAt would need to be added to User model if needed
            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/restaurants")
    public List<Map<String, Object>> getAllRestaurants() {
        return restaurantRepository.findAll().stream().map(restaurant -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", restaurant.getId());
            dto.put("name", restaurant.getName());
            dto.put("address", restaurant.getAddress());
            dto.put("phone", restaurant.getPhone());
            dto.put("cuisineType", restaurant.getCuisineType());
            dto.put("description", restaurant.getDescription());
            dto.put("openingHours", restaurant.getOpeningHours());
            dto.put("isActive", restaurant.getIsActive());
            dto.put("slug", restaurant.getSlug());
            // Note: createdAt would need to be added to Restaurant model if needed
            if (restaurant.getOwner() != null) {
                Map<String, Object> owner = new HashMap<>();
                owner.put("id", restaurant.getOwner().getId());
                owner.put("username", restaurant.getOwner().getUsername());
                owner.put("email", restaurant.getOwner().getEmail());
                dto.put("owner", owner);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> getAllOrders() {
        return orderRepository.findAll().stream().map(order -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", order.getId());
            dto.put("userId", order.getUserId());
            dto.put("restaurantId", order.getRestaurantId());
            dto.put("status", order.getStatus());
            dto.put("total", order.getTotal());
            // Convert order items to DTOs
            if (order.getItems() != null) {
                List<Map<String, Object>> items = order.getItems().stream().map(item -> {
                    Map<String, Object> itemDto = new HashMap<>();
                    itemDto.put("id", item.getId());
                    itemDto.put("menuItemId", item.getMenuItemId());
                    itemDto.put("name", item.getName());
                    itemDto.put("price", item.getPrice());
                    itemDto.put("quantity", item.getQuantity());
                    return itemDto;
                }).collect(Collectors.toList());
                dto.put("items", items);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/reviews")
    public List<Map<String, Object>> getAllReviews() {
        return reviewRepository.findAll().stream().map(review -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", review.getId());
            dto.put("orderId", review.getOrderId());
            dto.put("restaurantId", review.getRestaurantId());
            dto.put("menuItemId", review.getMenuItemId());
            dto.put("menuItemName", review.getMenuItemName());
            dto.put("rating", review.getRating());
            dto.put("text", review.getText());
            dto.put("isFlagged", review.getIsFlagged());
            dto.put("createdAt", review.getCreatedAt());
            if (review.getCustomer() != null) {
                dto.put("customerName", review.getCustomer().getUsername());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    // Block a user
    @PatchMapping("/users/{id}/block")
    @PostMapping("/users/{id}/block")
    public Map<String, Object> blockUser(@PathVariable Long id) {
        User user = customerRepository.findById(id).orElseThrow();
        user.setIsBlocked(true);
        User saved = customerRepository.save(user);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("username", saved.getUsername());
        dto.put("email", saved.getEmail());
        dto.put("role", saved.getRole());
        dto.put("isBlocked", saved.getIsBlocked());
        return dto;
    }
    // Unblock a user
    @PatchMapping("/users/{id}/unblock")
    @PostMapping("/users/{id}/unblock")
    public Map<String, Object> unblockUser(@PathVariable Long id) {
        User user = customerRepository.findById(id).orElseThrow();
        user.setIsBlocked(false);
        User saved = customerRepository.save(user);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("username", saved.getUsername());
        dto.put("email", saved.getEmail());
        dto.put("role", saved.getRole());
        dto.put("isBlocked", saved.getIsBlocked());
        return dto;
    }
    // Delete a user
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        customerRepository.deleteById(id);
    }

    // Approve a restaurant (set isActive=true)
    @PatchMapping("/restaurants/{id}/approve")
    @PostMapping("/restaurants/{id}/approve")
    public Map<String, Object> approveRestaurant(@PathVariable Long id) {
        Restaurant r = restaurantRepository.findById(id).orElseThrow();
        r.setIsActive(true);
        Restaurant saved = restaurantRepository.save(r);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("name", saved.getName());
        dto.put("isActive", saved.getIsActive());
        return dto;
    }
    // Deactivate a restaurant (set isActive=false)
    @PatchMapping("/restaurants/{id}/deactivate")
    @PostMapping("/restaurants/{id}/deactivate")
    public Map<String, Object> deactivateRestaurant(@PathVariable Long id) {
        Restaurant r = restaurantRepository.findById(id).orElseThrow();
        r.setIsActive(false);
        Restaurant saved = restaurantRepository.save(r);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("name", saved.getName());
        dto.put("isActive", saved.getIsActive());
        return dto;
    }
    // Delete a restaurant
    @DeleteMapping("/restaurants/{id}")
    public void deleteRestaurant(@PathVariable Long id) {
        restaurantRepository.deleteById(id);
    }

    // Cancel an order (set status="Cancelled")
    @PatchMapping("/orders/{id}/cancel")
    @PostMapping("/orders/{id}/cancel")
    public Map<String, Object> cancelOrder(@PathVariable Long id) {
        Order o = orderRepository.findById(id).orElseThrow();
        o.setStatus("Cancelled");
        Order saved = orderRepository.save(o);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("status", saved.getStatus());
        dto.put("total", saved.getTotal());
        return dto;
    }
    // Refund an order (set status="Refunded")
    @PatchMapping("/orders/{id}/refund")
    @PostMapping("/orders/{id}/refund")
    public Map<String, Object> refundOrder(@PathVariable Long id) {
        Order o = orderRepository.findById(id).orElseThrow();
        o.setStatus("Refunded");
        Order saved = orderRepository.save(o);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("status", saved.getStatus());
        dto.put("total", saved.getTotal());
        return dto;
    }
    // Delete an order
    @DeleteMapping("/orders/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderRepository.deleteById(id);
    }

    // Remove a review (delete)
    @DeleteMapping("/reviews/{id}")
    public void deleteReview(@PathVariable Long id) {
        reviewRepository.deleteById(id);
    }
    // Flag a review
    @PatchMapping("/reviews/{id}/flag")
    @PostMapping("/reviews/{id}/flag")
    public Map<String, Object> flagReview(@PathVariable Long id) {
        Review r = reviewRepository.findById(id).orElseThrow();
        r.setIsFlagged(true);
        Review saved = reviewRepository.save(r);
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", saved.getId());
        dto.put("isFlagged", saved.getIsFlagged());
        return dto;
    }
} 