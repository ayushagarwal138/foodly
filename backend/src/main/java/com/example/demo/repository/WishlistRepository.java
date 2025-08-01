package com.example.demo.repository;

import com.example.demo.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
 
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByCustomerId(Long customerId);
    List<Wishlist> findByCustomerIdAndType(Long customerId, String type);
    void deleteByCustomerIdAndTypeAndNameAndRestaurant(Long customerId, String type, String name, String restaurant);
    
    // Check for duplicate restaurant favorites
    boolean existsByCustomerIdAndTypeAndNameAndRestaurantId(Long customerId, String type, String name, Long restaurantId);
    
    // Check for duplicate dish favorites
    boolean existsByCustomerIdAndTypeAndNameAndRestaurantIdAndMenuItemId(Long customerId, String type, String name, Long restaurantId, Long menuItemId);
    
    // Find specific wishlist item for removal
    Wishlist findByCustomerIdAndTypeAndNameAndRestaurantId(Long customerId, String type, String name, Long restaurantId);
    
    // Find specific dish wishlist item for removal
    Wishlist findByCustomerIdAndTypeAndNameAndRestaurantIdAndMenuItemId(Long customerId, String type, String name, Long restaurantId, Long menuItemId);
} 