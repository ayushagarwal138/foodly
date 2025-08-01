package com.example.demo.repository;

import com.example.demo.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    
    // Find all active offers
    List<Offer> findByIsActiveTrue();
    
    // Find active offers by type
    List<Offer> findByIsActiveTrueAndType(String type);
    
    // Find active offers that are still valid
    @Query("SELECT o FROM Offer o WHERE o.isActive = true AND o.validUntil > :now")
    List<Offer> findActiveAndValidOffers(@Param("now") LocalDateTime now);
    
    // Find active and valid offers by type
    @Query("SELECT o FROM Offer o WHERE o.isActive = true AND o.validUntil > :now AND o.type = :type")
    List<Offer> findActiveAndValidOffersByType(@Param("now") LocalDateTime now, @Param("type") String type);
    
    // Find offers by restaurant (including "All Restaurants")
    @Query("SELECT o FROM Offer o WHERE o.isActive = true AND o.validUntil > :now AND (o.restaurantId = :restaurantId OR o.restaurantId IS NULL)")
    List<Offer> findOffersForRestaurant(@Param("now") LocalDateTime now, @Param("restaurantId") Long restaurantId);
    
    // Find offers by category
    List<Offer> findByIsActiveTrueAndCategory(String category);
    
    // Find offers expiring soon (within next 7 days)
    @Query("SELECT o FROM Offer o WHERE o.isActive = true AND o.validUntil BETWEEN :now AND :weekFromNow")
    List<Offer> findOffersExpiringSoon(@Param("now") LocalDateTime now, @Param("weekFromNow") LocalDateTime weekFromNow);
    
    // Check if coupon code exists and is valid
    @Query("SELECT o FROM Offer o WHERE o.isActive = true AND o.validUntil > :now AND o.code = :code")
    Offer findByCodeAndValid(@Param("now") LocalDateTime now, @Param("code") String code);
} 