package com.example.demo.repository;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = "items")
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = "items")
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @EntityGraph(attributePaths = "items")
    Optional<Order> findByIdAndRestaurantId(Long id, Long restaurantId);

    @EntityGraph(attributePaths = "items")
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = "items")
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
} 
