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
    public Optional<Order> getOrderById(@PathVariable Long id) {
        return orderRepository.findById(id);
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
        List<Order> orders = orderRepository.findAll().stream().filter(o -> o.getUserId().equals(customer.getId())).toList();
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
    public Order updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, Object> request) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        String newStatus = (String) request.get("status");
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
} 