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
@CrossOrigin(origins = "*")
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
        msg.setTimestamp(new java.util.Date());
        return chatRepo.save(msg);
    }
} 