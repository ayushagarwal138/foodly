package com.example.demo.config;

import com.example.demo.model.Offer;
import com.example.demo.repository.OfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private OfferRepository offerRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only initialize if no offers exist
        if (offerRepository.count() == 0) {
            initializeOffers();
        }
    }

    private void initializeOffers() {
        LocalDateTime now = LocalDateTime.now();
        
        Offer[] offers = {
            createOffer("discount", "First Order Special", "Get 50% off on your first order up to ₹200", "50% OFF", "₹200", "FIRST50", now.plusMonths(6), "₹100", "new-user", "All Restaurants", null, "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop", "bg-gradient-to-r from-purple-500 to-pink-500"),
            
            createOffer("free-delivery", "Free Delivery Weekend", "Free delivery on all orders above ₹150 this weekend", "FREE DELIVERY", "₹50", "FREEDEL", now.plusWeeks(2), "₹150", "delivery", "All Restaurants", null, "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop", "bg-gradient-to-r from-green-500 to-teal-500"),
            
            createOffer("cashback", "Cashback Bonanza", "Get 10% cashback on orders above ₹300", "10% CASHBACK", "₹100", "CASHBACK10", now.plusWeeks(3), "₹300", "cashback", "All Restaurants", null, "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop", "bg-gradient-to-r from-orange-500 to-red-500"),
            
            createOffer("combo", "Pizza + Drink Combo", "Buy any large pizza and get a soft drink free", "COMBO OFFER", "₹80", "PIZZACOMBO", now.plusWeeks(4), "₹200", "combo", "Pizza Palace", null, "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop", "bg-gradient-to-r from-yellow-500 to-orange-500"),
            
            createOffer("discount", "Weekday Special", "20% off on all orders from Monday to Thursday", "20% OFF", "₹150", "WEEKDAY20", now.plusMonths(3), "₹200", "weekday", "All Restaurants", null, "https://images.unsplash.com/photo-1504674900240-9a9049b3d378?w=400&h=300&fit=crop", "bg-gradient-to-r from-blue-500 to-indigo-500"),
            
            createOffer("free-item", "Buy 2 Get 1 Free", "Buy any 2 main course items and get 1 free", "BUY 2 GET 1", "₹200", "B2G1", now.plusWeeks(2), "₹250", "free-item", "All Restaurants", null, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", "bg-gradient-to-r from-pink-500 to-rose-500")
        };
        
        offerRepository.saveAll(Arrays.asList(offers));
        System.out.println("✅ Sample offers initialized successfully!");
    }
    
    private Offer createOffer(String type, String title, String description, String discount, String maxDiscount, 
                             String code, LocalDateTime validUntil, String minOrder, String category, 
                             String restaurant, Long restaurantId, String imageUrl, String color) {
        Offer offer = new Offer();
        offer.setType(type);
        offer.setTitle(title);
        offer.setDescription(description);
        offer.setDiscount(discount);
        offer.setMaxDiscount(maxDiscount);
        offer.setCode(code);
        offer.setValidUntil(validUntil);
        offer.setMinOrder(minOrder);
        offer.setCategory(category);
        offer.setRestaurant(restaurant);
        offer.setRestaurantId(restaurantId);
        offer.setImageUrl(imageUrl);
        offer.setColor(color);
        offer.setActive(true);
        return offer;
    }
} 