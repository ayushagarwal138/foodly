package com.example.demo.controller;

import com.example.demo.exception.ApiException;
import com.example.demo.model.ChatMessage;
import com.example.demo.model.MenuItem;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Set<String> ALLOWED_STATUSES = Set.of(
        "New", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Cancelled", "Refunded"
    );

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @GetMapping
    public List<Map<String, Object>> getAllOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        if (!"ADMIN".equals(user.getRole())) {
            throw new AccessDeniedException("Access denied");
        }
        return orderRepository.findAll().stream().map(this::toOrderDto).toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOrderById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        Order order = orderRepository.findById(id).orElseThrow();
        requireOrderAccess(user, order);
        return toOrderDto(order);
    }

    @PostMapping
    @Transactional
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> req, @AuthenticationPrincipal UserDetails userDetails) {
        User customer = authenticatedUser(userDetails);
        if (!"CUSTOMER".equals(customer.getRole())) {
            throw new AccessDeniedException("Only customers can place orders");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) req.get("items");
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("At least one order item is required");
        }

        Order order = new Order();
        order.setUserId(customer.getId());
        order.setStatus("New");

        double total = 0.0;
        Long restaurantId = null;
        List<OrderItem> orderItems = new java.util.ArrayList<>();

        for (Map<String, Object> item : items) {
            Long menuItemId = requiredLong(item.get("menu_item_id"), "menu_item_id is required in order item");
            Integer quantity = requiredInteger(item.get("qty"), "qty is required in order item");
            if (quantity <= 0) {
                throw new IllegalArgumentException("Order item quantity must be greater than zero");
            }

            MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found"));
            if (!Boolean.TRUE.equals(menuItem.getIsAvailable())) {
                throw new IllegalArgumentException("Menu item '" + menuItem.getName() + "' is not available");
            }
            if (menuItem.getRestaurant() == null) {
                throw new IllegalArgumentException("Menu item is not assigned to a restaurant");
            }

            Long itemRestaurantId = menuItem.getRestaurant().getId();
            if (restaurantId == null) {
                restaurantId = itemRestaurantId;
                order.setRestaurantId(restaurantId);
            } else if (!restaurantId.equals(itemRestaurantId)) {
                throw new IllegalArgumentException("All order items must belong to the same restaurant");
            }

            if (Boolean.TRUE.equals(menuItem.getShowQuantity()) && menuItem.getQuantityAvailable() != null) {
                if (quantity > menuItem.getQuantityAvailable()) {
                    throw new IllegalArgumentException("Insufficient quantity for '" + menuItem.getName() + "'. Available: " + menuItem.getQuantityAvailable());
                }
                menuItem.setQuantityAvailable(menuItem.getQuantityAvailable() - quantity);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItemId(menuItem.getId());
            orderItem.setName(menuItem.getName());
            orderItem.setPrice(menuItem.getPrice());
            orderItem.setQuantity(quantity);
            orderItems.add(orderItem);
            total += menuItem.getPrice() * quantity;
        }

        order.setTotal(total);
        order.setItems(orderItems);
        return toOrderDto(orderRepository.save(order));
    }

    @GetMapping("/my")
    public List<Map<String, Object>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User customer = authenticatedUser(userDetails);
        if (!"CUSTOMER".equals(customer.getRole())) {
            throw new AccessDeniedException("Only customers can view this order list");
        }
        return orderRepository.findByUserIdOrderByCreatedAtDesc(customer.getId()).stream()
            .map(order -> toOrderDto(order, customer))
            .toList();
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<Map<String, Object>> getOrdersForRestaurant(@PathVariable Long restaurantId,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        requireRestaurantOwner(user, restaurantId);
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
            .map(this::toOrderDto)
            .toList();
    }

    @PutMapping("/{id}")
    @Transactional
    public Map<String, Object> updateOrder(@PathVariable Long id, @RequestBody Order orderDetails,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        Order order = orderRepository.findById(id).orElseThrow();
        requireRestaurantOwner(user, order.getRestaurantId());
        if (orderDetails.getStatus() != null) {
            String previousStatus = order.getStatus();
            String newStatus = validatedStatus(orderDetails.getStatus());
            order.setStatus(newStatus);
            notifyCustomerWhenStatusChanges(order, previousStatus, newStatus);
        }
        return toOrderDto(orderRepository.save(order));
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        throw new AccessDeniedException("Order deletion is only available through admin management");
    }

    @PutMapping("/{orderId}/status")
    @Transactional
    public Map<String, Object> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, Object> request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = authenticatedUser(userDetails);
        Order order = orderRepository.findById(orderId).orElseThrow();
        requireRestaurantOwner(user, order.getRestaurantId());

        String newStatus = stringValue(request.get("status"));
        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        String previousStatus = order.getStatus();
        String validatedStatus = validatedStatus(newStatus.trim());
        order.setStatus(validatedStatus);
        notifyCustomerWhenStatusChanges(order, previousStatus, validatedStatus);
        return toOrderDto(orderRepository.save(order));
    }

    private void notifyCustomerWhenStatusChanges(Order order, String previousStatus, String newStatus) {
        if (newStatus == null || newStatus.equals(previousStatus)) {
            return;
        }

        ChatMessage notification = new ChatMessage();
        notification.setOrderId(order.getId());
        notification.setCustomerId(order.getUserId());
        notification.setRestaurantId(order.getRestaurantId());
        notification.setSender("restaurant");
        notification.setMessage("Order status update: Order #" + order.getId() + " is now " + newStatus + ".");
        notification.setTimestamp(new java.util.Date());
        notification.setIsRead(false);
        chatMessageRepository.save(notification);
    }

    private void requireOrderAccess(User user, Order order) {
        if ("ADMIN".equals(user.getRole())) {
            return;
        }
        if ("CUSTOMER".equals(user.getRole()) && order.getUserId().equals(user.getId())) {
            return;
        }
        if (isRestaurantRole(user) && ownsRestaurant(user, order.getRestaurantId())) {
            return;
        }
        throw new AccessDeniedException("Forbidden");
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

    private boolean isRestaurantRole(User user) {
        return "RESTAURANT".equals(user.getRole()) || "RESTAURANT_OWNER".equals(user.getRole());
    }

    private User authenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ApiException("UNAUTHENTICATED", "Authentication required", HttpStatus.UNAUTHORIZED);
        }
        return customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
    }

    private String validatedStatus(String status) {
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Unsupported order status");
        }
        return status;
    }

    private Map<String, Object> toOrderDto(Order order) {
        User customer = order.getUserId() != null ? customerRepository.findById(order.getUserId()).orElse(null) : null;
        return toOrderDto(order, customer);
    }

    private Map<String, Object> toOrderDto(Order order, User customer) {
        Map<String, Object> dto = new java.util.HashMap<>();
        dto.put("id", order.getId());
        dto.put("userId", order.getUserId());
        dto.put("restaurantId", order.getRestaurantId());
        dto.put("status", order.getStatus());
        dto.put("total", order.getTotal());
        dto.put("createdAt", order.getCreatedAt());
        dto.put("created_at", order.getCreatedAt());
        dto.put("date", order.getCreatedAt() != null ? order.getCreatedAt() : order.getId());
        if (customer != null) {
            dto.put("customerName", customer.getUsername());
            dto.put("customerEmail", customer.getEmail());
        }
        if (order.getRestaurantId() != null) {
            restaurantRepository.findById(order.getRestaurantId()).ifPresent(restaurant -> {
                dto.put("restaurantName", restaurant.getName());
                dto.put("restaurant", restaurant.getName());
                dto.put("restaurantAddress", restaurant.getAddress());
            });
        }
        List<Map<String, Object>> items = order.getItems() == null ? List.of() : order.getItems().stream().map(item -> {
            Map<String, Object> itemDto = new java.util.HashMap<>();
            itemDto.put("id", item.getId());
            itemDto.put("menuItemId", item.getMenuItemId());
            itemDto.put("name", item.getName());
            itemDto.put("price", item.getPrice());
            itemDto.put("quantity", item.getQuantity());
            return itemDto;
        }).toList();
        dto.put("items", items);
        return dto;
    }

    private Long requiredLong(Object value, String message) {
        if (value == null) {
            throw new IllegalArgumentException(message);
        }
        return Long.valueOf(value.toString());
    }

    private Integer requiredInteger(Object value, String message) {
        if (value == null) {
            throw new IllegalArgumentException(message);
        }
        return Integer.valueOf(value.toString());
    }

    private String stringValue(Object value) {
        return value instanceof String string ? string : null;
    }
}
