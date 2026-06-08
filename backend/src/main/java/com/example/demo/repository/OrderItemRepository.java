package com.example.demo.repository;

import com.example.demo.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
 
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    boolean existsByMenuItemId(Long menuItemId);
    boolean existsByOrderIdAndMenuItemId(Long orderId, Long menuItemId);
} 
