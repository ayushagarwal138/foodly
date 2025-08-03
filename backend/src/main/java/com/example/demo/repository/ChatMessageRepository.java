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
    
    // Unread message methods
    long countByCustomerIdAndSenderAndIsReadFalse(Long customerId, String sender);
    long countByRestaurantIdAndSenderAndIsReadFalse(Long restaurantId, String sender);
    List<ChatMessage> findByOrderIdAndCustomerIdAndSenderAndIsReadFalse(Long orderId, Long customerId, String sender);
    List<ChatMessage> findByOrderIdAndRestaurantIdAndSenderAndIsReadFalse(Long orderId, Long restaurantId, String sender);
} 