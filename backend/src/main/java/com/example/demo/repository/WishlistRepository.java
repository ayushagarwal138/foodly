package com.example.demo.repository;

import com.example.demo.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
 
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByCustomerId(Long customerId);
    List<Wishlist> findByCustomerIdAndType(Long customerId, String type);
    void deleteByCustomerIdAndTypeAndNameAndRestaurant(Long customerId, String type, String name, String restaurant);
} 