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
    public List<User> getAllUsers() {
        return customerRepository.findAll();
    }

    @GetMapping("/restaurants")
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/reviews")
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // Block a user
    @PatchMapping("/users/{id}/block")
    public User blockUser(@PathVariable Long id) {
        User user = customerRepository.findById(id).orElseThrow();
        user.setRole("BLOCKED"); // Or add a status field if available
        return customerRepository.save(user);
    }
    // Unblock a user
    @PatchMapping("/users/{id}/unblock")
    public User unblockUser(@PathVariable Long id) {
        User user = customerRepository.findById(id).orElseThrow();
        if ("BLOCKED".equals(user.getRole())) user.setRole("CUSTOMER"); // Or restore previous role
        return customerRepository.save(user);
    }
    // Delete a user
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        customerRepository.deleteById(id);
    }

    // Approve a restaurant (set isActive=true)
    @PatchMapping("/restaurants/{id}/approve")
    public Restaurant approveRestaurant(@PathVariable Long id) {
        Restaurant r = restaurantRepository.findById(id).orElseThrow();
        r.setIsActive(true);
        return restaurantRepository.save(r);
    }
    // Deactivate a restaurant (set isActive=false)
    @PatchMapping("/restaurants/{id}/deactivate")
    public Restaurant deactivateRestaurant(@PathVariable Long id) {
        Restaurant r = restaurantRepository.findById(id).orElseThrow();
        r.setIsActive(false);
        return restaurantRepository.save(r);
    }
    // Delete a restaurant
    @DeleteMapping("/restaurants/{id}")
    public void deleteRestaurant(@PathVariable Long id) {
        restaurantRepository.deleteById(id);
    }

    // Cancel an order (set status="Cancelled")
    @PatchMapping("/orders/{id}/cancel")
    public Order cancelOrder(@PathVariable Long id) {
        Order o = orderRepository.findById(id).orElseThrow();
        o.setStatus("Cancelled");
        return orderRepository.save(o);
    }
    // Refund an order (set status="Refunded")
    @PatchMapping("/orders/{id}/refund")
    public Order refundOrder(@PathVariable Long id) {
        Order o = orderRepository.findById(id).orElseThrow();
        o.setStatus("Refunded");
        return orderRepository.save(o);
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
    // Flag a review (could set a flag field, here just a stub)
    @PatchMapping("/reviews/{id}/flag")
    public Review flagReview(@PathVariable Long id) {
        Review r = reviewRepository.findById(id).orElseThrow();
        // r.setFlagged(true); // If you have a flagged field
        return reviewRepository.save(r);
    }
} 