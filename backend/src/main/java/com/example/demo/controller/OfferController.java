package com.example.demo.controller;

import com.example.demo.model.Offer;
import com.example.demo.repository.OfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "*")
public class OfferController {
    
    @Autowired
    private OfferRepository offerRepository;
    
    // Get all active and valid offers (public endpoint)
    @GetMapping
    public ResponseEntity<List<Offer>> getAllOffers() {
        List<Offer> offers = offerRepository.findActiveAndValidOffers(LocalDateTime.now());
        return ResponseEntity.ok(offers);
    }
    
    // Admin endpoint to get all offers (including inactive ones)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Offer>> getAllOffersForAdmin() {
        List<Offer> offers = offerRepository.findAll();
        return ResponseEntity.ok(offers);
    }
    
    // Get offers by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Offer>> getOffersByType(@PathVariable String type) {
        List<Offer> offers = offerRepository.findActiveAndValidOffersByType(LocalDateTime.now(), type);
        return ResponseEntity.ok(offers);
    }
    
    // Get offers for a specific restaurant
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Offer>> getOffersForRestaurant(@PathVariable Long restaurantId) {
        List<Offer> offers = offerRepository.findOffersForRestaurant(LocalDateTime.now(), restaurantId);
        return ResponseEntity.ok(offers);
    }
    
    // Get offers by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Offer>> getOffersByCategory(@PathVariable String category) {
        List<Offer> offers = offerRepository.findByIsActiveTrueAndCategory(category);
        return ResponseEntity.ok(offers);
    }
    
    // Get offers expiring soon
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<Offer>> getOffersExpiringSoon() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekFromNow = now.plusDays(7);
        List<Offer> offers = offerRepository.findOffersExpiringSoon(now, weekFromNow);
        return ResponseEntity.ok(offers);
    }
    
    // Validate coupon code
    @PostMapping("/validate-coupon")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        Long restaurantId = request.get("restaurantId") != null ? Long.valueOf(request.get("restaurantId")) : null;
        
        Offer offer = offerRepository.findByCodeAndValid(LocalDateTime.now(), code);
        
        Map<String, Object> response = new HashMap<>();
        
        if (offer == null) {
            response.put("valid", false);
            response.put("message", "Invalid or expired coupon code");
            return ResponseEntity.ok(response);
        }
        
        // Check if offer is applicable to the restaurant
        if (offer.getRestaurantId() != null && !offer.getRestaurantId().equals(restaurantId)) {
            response.put("valid", false);
            response.put("message", "This coupon is not valid for this restaurant");
            return ResponseEntity.ok(response);
        }
        
        response.put("valid", true);
        response.put("offer", offer);
        response.put("message", "Coupon is valid");
        
        return ResponseEntity.ok(response);
    }
    
    // Admin endpoints for managing offers
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Offer> createOffer(@RequestBody Offer offer) {
        offer.setActive(true);
        Offer savedOffer = offerRepository.save(offer);
        return ResponseEntity.ok(savedOffer);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Offer> updateOffer(@PathVariable Long id, @RequestBody Offer offerDetails) {
        Offer offer = offerRepository.findById(id).orElseThrow(() -> new RuntimeException("Offer not found"));
        
        offer.setType(offerDetails.getType());
        offer.setTitle(offerDetails.getTitle());
        offer.setDescription(offerDetails.getDescription());
        offer.setDiscount(offerDetails.getDiscount());
        offer.setMaxDiscount(offerDetails.getMaxDiscount());
        offer.setCode(offerDetails.getCode());
        offer.setValidUntil(offerDetails.getValidUntil());
        offer.setMinOrder(offerDetails.getMinOrder());
        offer.setCategory(offerDetails.getCategory());
        offer.setRestaurant(offerDetails.getRestaurant());
        offer.setRestaurantId(offerDetails.getRestaurantId());
        offer.setImageUrl(offerDetails.getImageUrl());
        offer.setColor(offerDetails.getColor());
        offer.setActive(offerDetails.isActive());
        
        Offer updatedOffer = offerRepository.save(offer);
        return ResponseEntity.ok(updatedOffer);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteOffer(@PathVariable Long id) {
        Offer offer = offerRepository.findById(id).orElseThrow(() -> new RuntimeException("Offer not found"));
        offerRepository.delete(offer);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Offer> toggleOfferStatus(@PathVariable Long id) {
        Offer offer = offerRepository.findById(id).orElseThrow(() -> new RuntimeException("Offer not found"));
        offer.setActive(!offer.isActive());
        Offer updatedOffer = offerRepository.save(offer);
        return ResponseEntity.ok(updatedOffer);
    }
} 