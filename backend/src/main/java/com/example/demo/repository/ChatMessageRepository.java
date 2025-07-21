package com.example.demo.repository;

import com.example.demo.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByOrderIdAndCustomerIdAndRestaurantIdOrderByTimestamp(
        Long orderId, Long customerId, Long restaurantId
    );
    List<ChatMessage> findByOrderIdAndRestaurantIdOrderByTimestamp(Long orderId, Long restaurantId);
    List<ChatMessage> findByOrderIdOrderByTimestamp(Long orderId);
    List<ChatMessage> findByRestaurantIdOrderByTimestamp(Long restaurantId);
} 