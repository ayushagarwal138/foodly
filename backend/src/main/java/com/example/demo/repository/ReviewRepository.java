package com.example.demo.repository;

import com.example.demo.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
 
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCustomerId(Long customerId);
    List<Review> findByRestaurantId(Long restaurantId);
    List<Review> findByOrderId(Long orderId);
    List<Review> findByMenuItemId(Long menuItemId);
} 