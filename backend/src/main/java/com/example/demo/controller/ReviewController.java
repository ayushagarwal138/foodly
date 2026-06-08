package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.model.Order;
import com.example.demo.model.Restaurant;
import com.example.demo.model.MenuItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;

    @GetMapping("/my")
    public List<Map<String, Object>> getMyReviews(@AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<Review> reviews = reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId());
        return reviews.stream()
            .map(review -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", review.getId());
                map.put("orderId", review.getOrderId());
                map.put("rating", review.getRating());
                map.put("text", review.getText());
                map.put("timestamp", review.getCreatedAt());
                map.put("itemName", review.getMenuItemName());
                Restaurant rest = review.getRestaurantId() != null ? 
                    restaurantRepository.findById(review.getRestaurantId()).orElse(null) : null;
                map.put("restaurantName", rest != null ? rest.getName() : null);
                return map;
            })
            .toList();
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<Map<String, Object>> getRestaurantReviews(@PathVariable Long restaurantId) {
        List<Review> reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);
        return reviews.stream()
            .map(review -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", review.getId());
                map.put("rating", review.getRating());
                map.put("text", review.getText());
                map.put("timestamp", review.getCreatedAt());
                map.put("itemName", review.getMenuItemName());
                map.put("customerName", review.getCustomer() != null ? review.getCustomer().getUsername() : "Anonymous");
                return map;
            })
            .toList();
    }

    @PostMapping
    public Review createReview(@RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Check if user exists and is a customer
            User customer = customerRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
            
            // Verify user role is CUSTOMER
            if (!"CUSTOMER".equals(customer.getRole())) {
                throw new RuntimeException("Only customers can submit reviews");
            }
            
            Review review = new Review();
            review.setCustomer(customer);
            
            Long orderId = Long.valueOf(request.get("orderId").toString());
            Long menuItemId = Long.valueOf(request.get("menuItemId").toString());
            
            // Get order and menu item details
            Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
            MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
            
            // Verify the order belongs to this customer
            if (!order.getUserId().equals(customer.getId())) {
                throw new AccessDeniedException("Order does not belong to this customer");
            }
            if (!orderItemRepository.existsByOrderIdAndMenuItemId(orderId, menuItemId)) {
                throw new IllegalArgumentException("Menu item was not part of this order");
            }
            if (!order.getRestaurantId().equals(menuItem.getRestaurant().getId())) {
                throw new IllegalArgumentException("Menu item does not belong to this order's restaurant");
            }
            if (reviewRepository.existsByOrderIdAndMenuItemIdAndCustomerId(orderId, menuItemId, customer.getId())) {
                throw new IllegalArgumentException("Review already exists for this order item");
            }

            int rating = Integer.valueOf(request.get("rating").toString());
            if (rating < 1 || rating > 5) {
                throw new IllegalArgumentException("Rating must be between 1 and 5");
            }
            
            review.setOrderId(orderId);
            review.setRestaurantId(order.getRestaurantId());
            review.setMenuItemId(menuItemId);
            review.setMenuItemName(menuItem.getName());
            review.setRating(rating);
            review.setText((String) request.get("text"));
            
            return reviewRepository.save(review);
        } catch (AccessDeniedException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create review: " + e.getMessage());
        }
    }
} 
