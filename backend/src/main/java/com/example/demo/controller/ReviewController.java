package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.model.Order;
import com.example.demo.model.Restaurant;
import com.example.demo.model.MenuItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.*;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
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
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        Review review = new Review();
        review.setCustomer(customer);
        
        Long orderId = Long.valueOf(request.get("orderId").toString());
        Long menuItemId = Long.valueOf(request.get("menuItemId").toString());
        
        // Get order and menu item details
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        review.setOrderId(orderId);
        review.setRestaurantId(order.getRestaurantId());
        review.setMenuItemId(menuItemId);
        review.setMenuItemName(menuItem.getName());
        review.setRating(Integer.valueOf(request.get("rating").toString()));
        review.setText((String) request.get("text"));
        
        return reviewRepository.save(review);
    }
} 