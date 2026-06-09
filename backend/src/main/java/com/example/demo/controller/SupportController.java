package com.example.demo.controller;

import com.example.demo.exception.ApiException;
import com.example.demo.model.ChatMessage;
import com.example.demo.model.Order;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/support")
public class SupportController {
    @Autowired
    private ChatMessageRepository chatRepo;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;

    @GetMapping("/messages")
    public List<ChatMessage> getMessages(
        @RequestParam Long orderId,
        @RequestParam(required = false) Long customerId,
        @RequestParam(required = false) Long restaurantId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authenticatedUser(userDetails);
        Order order = chatOrder(orderId);
        requireOrderChatAccess(user, order);
        requireOptionalScopeMatchesOrder(customerId, restaurantId, order);
        return chatRepo.findByOrderIdAndCustomerIdAndRestaurantIdOrderByTimestamp(
            orderId, order.getUserId(), order.getRestaurantId()
        );
    }

    @GetMapping("/messages/restaurant/{restaurantId}")
    public List<ChatMessage> getMessagesForRestaurant(@PathVariable Long restaurantId,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        requireRestaurantOwner(user, restaurantId);
        return chatRepo.findByRestaurantIdOrderByTimestamp(restaurantId);
    }
    
    @PostMapping("/messages")
    public ChatMessage addMessage(@RequestBody ChatMessage msg, @AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        Order order = activeChatOrder(msg.getOrderId());
        requireOrderChatAccess(user, order);

        ChatMessage message = new ChatMessage();
        message.setOrderId(order.getId());
        message.setCustomerId(order.getUserId());
        message.setRestaurantId(order.getRestaurantId());
        message.setSender(isRestaurantRole(user) ? "restaurant" : "customer");
        message.setMessage(msg.getMessage());
        message.setTimestamp(new java.util.Date());
        message.setIsRead(false);
        return chatRepo.save(message);
    }

    @GetMapping("/messages/unread-count")
    public Map<String, Object> getUnreadMessageCount(
        @RequestParam(required = false) Long customerId,
        @RequestParam(required = false) Long restaurantId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = authenticatedUser(userDetails);
        Map<String, Object> result = new HashMap<>();
        
        if ("CUSTOMER".equals(user.getRole())) {
            if (customerId != null && !customerId.equals(user.getId())) {
                throw new AccessDeniedException("Forbidden");
            }
            result.put("customerUnread", chatRepo.countByCustomerIdAndSenderAndIsReadFalse(user.getId(), "restaurant"));
            return result;
        }

        Long ownedRestaurantId = ownedRestaurantId(user);
        if (restaurantId != null && !restaurantId.equals(ownedRestaurantId)) {
            throw new AccessDeniedException("Forbidden");
        }
        result.put("restaurantUnread", chatRepo.countByRestaurantIdAndSenderAndIsReadFalse(ownedRestaurantId, "customer"));
        return result;
    }

    @GetMapping("/messages/notifications")
    public Map<String, Object> getUnreadNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        boolean customer = "CUSTOMER".equals(user.getRole());
        List<ChatMessage> unreadMessages = customer
            ? chatRepo.findByCustomerIdAndSenderAndIsReadFalseOrderByTimestampDesc(user.getId(), "restaurant")
            : chatRepo.findByRestaurantIdAndSenderAndIsReadFalseOrderByTimestampDesc(ownedRestaurantId(user), "customer");

        Set<Long> restaurantIds = unreadMessages.stream()
            .map(ChatMessage::getRestaurantId)
            .filter(id -> id != null)
            .collect(Collectors.toSet());
        Set<Long> orderIds = unreadMessages.stream()
            .map(ChatMessage::getOrderId)
            .filter(id -> id != null)
            .collect(Collectors.toSet());
        Set<Long> customerIds = unreadMessages.stream()
            .map(ChatMessage::getCustomerId)
            .filter(id -> id != null)
            .collect(Collectors.toSet());

        Map<Long, Restaurant> restaurantsById = restaurantRepository.findAllById(restaurantIds).stream()
            .collect(Collectors.toMap(Restaurant::getId, Function.identity()));
        Map<Long, Order> ordersById = orderRepository.findAllById(orderIds).stream()
            .collect(Collectors.toMap(Order::getId, Function.identity()));
        Map<Long, User> customersById = customerRepository.findAllById(customerIds).stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));

        List<Map<String, Object>> notifications = new ArrayList<>();
        for (ChatMessage message : unreadMessages) {
            Restaurant restaurant = restaurantsById.get(message.getRestaurantId());
            Order order = ordersById.get(message.getOrderId());
            User customerUser = customersById.get(message.getCustomerId());

            Map<String, Object> notification = new HashMap<>();
            notification.put("id", message.getId());
            notification.put("messageId", message.getId());
            notification.put("orderId", message.getOrderId());
            notification.put("restaurantId", message.getRestaurantId());
            notification.put("customerId", message.getCustomerId());
            notification.put("sender", message.getSender());
            notification.put("message", message.getMessage());
            notification.put("timestamp", message.getTimestamp());
            notification.put("isRead", Boolean.TRUE.equals(message.getIsRead()));
            notification.put("restaurantName", restaurant != null ? restaurant.getName() : "Restaurant");
            notification.put("restaurantSlug", restaurant != null ? restaurant.getSlug() : null);
            notification.put("customerName", customerUser != null ? customerUser.getUsername() : "Customer");
            notification.put("orderStatus", order != null ? order.getStatus() : null);
            notification.put("orderTotal", order != null ? order.getTotal() : null);
            notification.put("targetPath", customer
                ? "/customer/support?orderId=" + message.getOrderId() + "&restaurantId=" + message.getRestaurantId()
                : "/restaurant/orders?orderId=" + message.getOrderId()
            );
            notifications.add(notification);
        }

        notifications.sort(Comparator.comparing(
            notification -> Optional.ofNullable(notification.get("timestamp"))
                .filter(java.util.Date.class::isInstance)
                .map(java.util.Date.class::cast)
                .orElse(new java.util.Date(0)),
            Comparator.reverseOrder()
        ));

        return Map.of(
            "unreadCount", notifications.size(),
            "notifications", notifications
        );
    }

    @PutMapping("/messages/{messageId}/mark-read")
    public ChatMessage markMessageAsRead(@PathVariable Long messageId, @AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        ChatMessage message = chatRepo.findById(messageId).orElseThrow(() -> new RuntimeException("Message not found"));
        Order order = orderRepository.findById(message.getOrderId()).orElseThrow(() -> new RuntimeException("Order not found"));
        requireOrderChatAccess(user, order);
        requireRecipient(user, message);
        message.setIsRead(true);
        return chatRepo.save(message);
    }

    @PutMapping("/messages/mark-all-read")
    @Transactional
    public Map<String, Object> markAllMessagesAsRead(
        @RequestParam(required = false) Long customerId,
        @RequestParam(required = false) Long restaurantId,
        @RequestParam(required = false) Long orderId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (orderId == null) {
            throw new IllegalArgumentException("orderId is required");
        }
        User user = authenticatedUser(userDetails);
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        requireOrderChatAccess(user, order);
        requireOptionalScopeMatchesOrder(customerId, restaurantId, order);

        List<ChatMessage> messages;
        if ("CUSTOMER".equals(user.getRole())) {
            messages = chatRepo.findByOrderIdAndCustomerIdAndRestaurantIdAndSenderAndIsReadFalse(
                orderId, order.getUserId(), order.getRestaurantId(), "restaurant"
            );
        } else {
            messages = chatRepo.findByOrderIdAndCustomerIdAndRestaurantIdAndSenderAndIsReadFalse(
                orderId, order.getUserId(), order.getRestaurantId(), "customer"
            );
        }

        messages.forEach(msg -> msg.setIsRead(true));
        chatRepo.saveAll(messages);
        return Map.of("markedAsRead", messages.size());
    }

    private Order activeChatOrder(Long orderId) {
        Order order = chatOrder(orderId);
        if ("Delivered".equalsIgnoreCase(order.getStatus()) || "Cancelled".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException("CHAT_CLOSED", "Chat is disabled for delivered or cancelled orders.", HttpStatus.CONFLICT);
        }
        return order;
    }

    private Order chatOrder(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new ApiException("ORDER_NOT_FOUND", "Order not found", HttpStatus.NOT_FOUND));
    }

    private void requireOrderChatAccess(User user, Order order) {
        if ("CUSTOMER".equals(user.getRole()) && order.getUserId().equals(user.getId())) {
            return;
        }
        if (isRestaurantRole(user) && ownsRestaurant(user, order.getRestaurantId())) {
            return;
        }
        throw new AccessDeniedException("Forbidden");
    }

    private void requireRecipient(User user, ChatMessage message) {
        if ("CUSTOMER".equals(user.getRole()) && "restaurant".equals(message.getSender())) {
            return;
        }
        if (isRestaurantRole(user) && "customer".equals(message.getSender())) {
            return;
        }
        throw new AccessDeniedException("Forbidden");
    }

    private void requireOptionalScopeMatchesOrder(Long customerId, Long restaurantId, Order order) {
        if (customerId != null && !customerId.equals(order.getUserId())) {
            throw new AccessDeniedException("Forbidden");
        }
        if (restaurantId != null && !restaurantId.equals(order.getRestaurantId())) {
            throw new AccessDeniedException("Forbidden");
        }
    }

    private void requireRestaurantOwner(User user, Long restaurantId) {
        if (!isRestaurantRole(user) || !ownsRestaurant(user, restaurantId)) {
            throw new AccessDeniedException("Forbidden");
        }
    }

    private boolean ownsRestaurant(User user, Long restaurantId) {
        return restaurantId != null
            && restaurantRepository.findByOwner_Id(user.getId())
                .map(Restaurant::getId)
                .filter(restaurantId::equals)
                .isPresent();
    }

    private Long ownedRestaurantId(User user) {
        return restaurantRepository.findByOwner_Id(user.getId())
            .map(Restaurant::getId)
            .orElseThrow(() -> new AccessDeniedException("Restaurant not found for this user"));
    }

    private boolean isRestaurantRole(User user) {
        return "RESTAURANT".equals(user.getRole()) || "RESTAURANT_OWNER".equals(user.getRole());
    }

    private User authenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ApiException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        return customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
    }
} 
