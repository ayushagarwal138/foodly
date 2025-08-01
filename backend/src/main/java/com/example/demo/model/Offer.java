package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers")
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String type; // "discount", "free-delivery", "cashback", "combo", "free-item"
    private String title;
    private String description;
    private String discount; // e.g., "50% OFF", "FREE DELIVERY"
    private String maxDiscount; // e.g., "₹200"
    private String code; // coupon code
    private LocalDateTime validUntil;
    private String minOrder; // e.g., "₹100"
    private String category; // e.g., "new-user", "weekday"
    private String restaurant; // restaurant name or "All Restaurants"
    private Long restaurantId; // null for all restaurants
    private String imageUrl;
    private String color; // CSS color class
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getDiscount() { return discount; }
    public void setDiscount(String discount) { this.discount = discount; }
    
    public String getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(String maxDiscount) { this.maxDiscount = maxDiscount; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public LocalDateTime getValidUntil() { return validUntil; }
    public void setValidUntil(LocalDateTime validUntil) { this.validUntil = validUntil; }
    
    public String getMinOrder() { return minOrder; }
    public void setMinOrder(String minOrder) { this.minOrder = minOrder; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getRestaurant() { return restaurant; }
    public void setRestaurant(String restaurant) { this.restaurant = restaurant; }
    
    public Long getRestaurantId() { return restaurantId; }
    public void setRestaurantId(Long restaurantId) { this.restaurantId = restaurantId; }
    
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 