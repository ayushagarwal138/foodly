package com.example.demo.controller;

import com.example.demo.model.ChatMessage;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/support")
public class SupportController {
    @Autowired
    private ChatMessageRepository chatRepo;
    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/messages")
    public List<ChatMessage> getMessages(
        @RequestParam Long orderId,
        @RequestParam(required = false) Long customerId,
        @RequestParam(required = false) Long restaurantId
    ) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) throw new RuntimeException("Order not found");
        if ("Delivered".equalsIgnoreCase(order.getStatus()) || "Cancelled".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chat is disabled for delivered or cancelled orders.");
        }
        
        // If restaurantId is not provided, get it from the order
        if (restaurantId == null) {
            restaurantId = order.getRestaurantId();
        }
        
        if (customerId != null && restaurantId != null) {
            return chatRepo.findByOrderIdAndCustomerIdAndRestaurantIdOrderByTimestamp(orderId, customerId, restaurantId);
        } else if (restaurantId != null) {
            return chatRepo.findByOrderIdAndRestaurantIdOrderByTimestamp(orderId, restaurantId);
        } else {
            return chatRepo.findByOrderIdOrderByTimestamp(orderId);
        }
    }

    @GetMapping("/messages/restaurant/{restaurantId}")
    public List<ChatMessage> getMessagesForRestaurant(@PathVariable Long restaurantId) {
        return chatRepo.findByRestaurantIdOrderByTimestamp(restaurantId);
    }
    
    @PostMapping("/messages")
    public ChatMessage addMessage(@RequestBody ChatMessage msg) {
        Order order = orderRepository.findById(msg.getOrderId()).orElse(null);
        if (order == null) throw new RuntimeException("Order not found");
        if ("Delivered".equalsIgnoreCase(order.getStatus()) || "Cancelled".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Chat is disabled for delivered or cancelled orders.");
        }
        
        // If restaurantId is not provided, get it from the order
        if (msg.getRestaurantId() == null) {
            msg.setRestaurantId(order.getRestaurantId());
        }
        
        msg.setTimestamp(new java.util.Date());
        msg.setIsRead(false); // New messages are unread by default
        return chatRepo.save(msg);
    }

    @GetMapping("/messages/unread-count")
    public Map<String, Object> getUnreadMessageCount(
        @RequestParam(required = false) Long customerId,
        @RequestParam(required = false) Long restaurantId
    ) {
        Map<String, Object> result = new HashMap<>();
        
        if (customerId != null) {
            // Count unread messages for customer (messages from restaurant)
            long customerUnread = chatRepo.countByCustomerIdAndSenderAndIsReadFalse(customerId, "restaurant");
            result.put("customerUnread", customerUnread);
        }
        
        if (restaurantId != null) {
            // Count unread messages for restaurant (messages from customer)
            long restaurantUnread = chatRepo.countByRestaurantIdAndSenderAndIsReadFalse(restaurantId, "customer");
            result.put("restaurantUnread", restaurantUnread);
        }
        
        return result;
    }

    @PutMapping("/messages/{messageId}/mark-read")
    public ChatMessage markMessageAsRead(@PathVariable Long messageId) {
        ChatMessage message = chatRepo.findById(messageId).orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        return chatRepo.save(message);
    }

    @PutMapping("/messages/mark-all-read")
    public Map<String, Object> markAllMessagesAsRead(
        @RequestParam(required = false) Long customerId,
        @RequestParam(required = false) Long restaurantId,
        @RequestParam(required = false) Long orderId
    ) {
        Map<String, Object> result = new HashMap<>();
        
        if (customerId != null && orderId != null) {
            // Mark all restaurant messages as read for this customer and order
            List<ChatMessage> messages = chatRepo.findByOrderIdAndCustomerIdAndSenderAndIsReadFalse(orderId, customerId, "restaurant");
            messages.forEach(msg -> msg.setIsRead(true));
            chatRepo.saveAll(messages);
            result.put("markedAsRead", messages.size());
        }
        
        if (restaurantId != null && orderId != null) {
            // Mark all customer messages as read for this restaurant and order
            List<ChatMessage> messages = chatRepo.findByOrderIdAndRestaurantIdAndSenderAndIsReadFalse(orderId, restaurantId, "customer");
            messages.forEach(msg -> msg.setIsRead(true));
            chatRepo.saveAll(messages);
            result.put("markedAsRead", messages.size());
        }
        
        return result;
    }
} 