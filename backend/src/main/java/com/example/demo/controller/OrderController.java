package com.example.demo.controller;

import com.example.demo.model.Order;
import com.example.demo.model.MenuItem;
import com.example.demo.model.User;
import com.example.demo.model.OrderItem;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.OrderItemRepository;
import com.example.demo.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOrderById(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElseThrow();
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", order.getId());
        result.put("userId", order.getUserId());
        result.put("restaurantId", order.getRestaurantId());
        result.put("status", order.getStatus());
        result.put("total", order.getTotal());
        result.put("items", order.getItems());
        result.put("date", order.getId()); // You may want to add a date field if available
        result.put("createdAt", order.getId()); // Add createdAt for consistency
        // Add restaurant name
        String restaurantName = "";
        if (order.getRestaurantId() != null) {
            var restOpt = restaurantRepository.findById(order.getRestaurantId());
            if (restOpt.isPresent()) restaurantName = restOpt.get().getName();
        }
        result.put("restaurantName", restaurantName);
        return result;
    }

    @PostMapping
    public Order placeOrder(@RequestBody Map<String, Object> req, @AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) req.get("items");
        String address = (String) req.get("address");
        Long restaurantId = items != null && !items.isEmpty() ? Long.valueOf(items.get(0).get("restaurantId").toString()) : null;
        if (restaurantId == null) throw new IllegalArgumentException("restaurantId is required");
        Order order = new Order();
        order.setUserId(customer.getId());
        order.setRestaurantId(restaurantId);
        order.setStatus("NEW");
        double total = 0.0;
        List<OrderItem> orderItems = new java.util.ArrayList<>();
        if (items != null) {
            for (Map<String, Object> item : items) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                Object menuItemIdObj = item.get("menu_item_id");
                if (menuItemIdObj == null) {
                    throw new IllegalArgumentException("menu_item_id is required in order item");
                }
                orderItem.setMenuItemId(Long.valueOf(menuItemIdObj.toString()));
                orderItem.setName((String) item.get("name"));
                orderItem.setPrice(Double.valueOf(item.get("price").toString()));
                orderItem.setQuantity(Integer.valueOf(item.get("qty").toString()));
                orderItems.add(orderItem);
                total += orderItem.getPrice() * orderItem.getQuantity();
            }
        }
        order.setTotal(total);
        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        // Save order items (cascade should handle, but ensure saved)
        for (OrderItem oi : orderItems) {
            oi.setOrder(savedOrder);
            orderItemRepository.save(oi);
        }
        return savedOrder;
    }

    @GetMapping("/my")
    public List<Map<String, Object>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User customer = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<Order> orders = orderRepository.findAll().stream()
            .filter(o -> o.getUserId().equals(customer.getId()))
            .sorted((a, b) -> b.getId().compareTo(a.getId())) // Sort by ID descending (latest first)
            .toList();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", o.getId());
            map.put("userId", o.getUserId());
            map.put("restaurantId", o.getRestaurantId());
            map.put("status", o.getStatus());
            map.put("total", o.getTotal());
            map.put("items", o.getItems());
            map.put("date", o.getId()); // You may want to add a date field if available
            map.put("createdAt", o.getId()); // Add createdAt for consistency
            // Add restaurant name
            String restaurantName = "";
            if (o.getRestaurantId() != null) {
                var restOpt = restaurantRepository.findById(o.getRestaurantId());
                if (restOpt.isPresent()) restaurantName = restOpt.get().getName();
            }
            map.put("restaurant", restaurantName);
            result.add(map);
        }
        return result;
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<Order> getOrdersForRestaurant(@PathVariable Long restaurantId) {
        return orderRepository.findAll().stream()
            .filter(o -> o.getRestaurantId().equals(restaurantId))
            .sorted((a, b) -> b.getId().compareTo(a.getId())) // Sort by ID descending (latest first)
            .toList();
    }

    @PutMapping("/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestBody Order orderDetails) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setUserId(orderDetails.getUserId());
        order.setRestaurantId(orderDetails.getRestaurantId());
        order.setStatus(orderDetails.getStatus());
        order.setTotal(orderDetails.getTotal());
        return orderRepository.save(order);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderRepository.deleteById(id);
    }

    @PutMapping("/{orderId}/status")
    public Map<String, Object> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails userDetails) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        
        // Check if user is restaurant owner
        User user = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        if (!"RESTAURANT".equals(user.getRole())) {
            throw new RuntimeException("Only restaurant owners can update order status");
        }
        
        // Find the restaurant owned by this user
        var restaurantOpt = restaurantRepository.findAll().stream()
            .filter(r -> r.getOwner() != null && r.getOwner().getId().equals(user.getId()))
            .findFirst();
        
        if (restaurantOpt.isEmpty()) {
            throw new RuntimeException("Restaurant not found for this user");
        }
        
        // Verify restaurant owns this order
        if (!order.getRestaurantId().equals(restaurantOpt.get().getId())) {
            throw new RuntimeException("You can only update orders for your restaurant");
        }
        
        String newStatus = (String) request.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new RuntimeException("Status is required");
        }
        
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        // Return the updated order in the same format as getOrderById
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", updatedOrder.getId());
        result.put("userId", updatedOrder.getUserId());
        result.put("restaurantId", updatedOrder.getRestaurantId());
        result.put("status", updatedOrder.getStatus());
        result.put("total", updatedOrder.getTotal());
        result.put("items", updatedOrder.getItems());
        result.put("date", updatedOrder.getId());
        result.put("createdAt", updatedOrder.getId());
        
        // Add restaurant name
        String restaurantName = "";
        if (updatedOrder.getRestaurantId() != null) {
            var restOpt = restaurantRepository.findById(updatedOrder.getRestaurantId());
            if (restOpt.isPresent()) restaurantName = restOpt.get().getName();
        }
        result.put("restaurantName", restaurantName);
        
        return result;
    }
} 