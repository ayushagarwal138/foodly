package com.example.demo.controller;

import com.example.demo.model.Restaurant;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.model.MenuItem;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.model.Order;
import com.example.demo.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import java.text.Normalizer;
import java.util.regex.Pattern;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.demo.repository.CustomerRepository;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getRestaurantById(@PathVariable Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", restaurant.getId());
        result.put("name", restaurant.getName());
        result.put("address", restaurant.getAddress());
        result.put("phone", restaurant.getPhone());
        result.put("cuisineType", restaurant.getCuisineType());
        result.put("description", restaurant.getDescription());
        result.put("openingHours", restaurant.getOpeningHours());
        result.put("slug", restaurant.getSlug());
        result.put("isActive", restaurant.getIsActive());
        // Owner details
        if (restaurant.getOwner() != null) {
            Map<String, Object> owner = new java.util.HashMap<>();
            owner.put("id", restaurant.getOwner().getId());
            owner.put("username", restaurant.getOwner().getUsername());
            owner.put("email", restaurant.getOwner().getEmail());
            owner.put("role", restaurant.getOwner().getRole());
            result.put("owner", owner);
        } else {
            result.put("owner", null);
        }
        return result;
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getRestaurantBySlug(@PathVariable String slug) {
        Optional<Restaurant> restaurant = restaurantRepository.findBySlug(slug);
        if (restaurant.isPresent()) {
            return ResponseEntity.ok(restaurant.get());
        } else {
            return ResponseEntity.status(404).body("Restaurant not found");
        }
    }

    @GetMapping("/by-owner/{ownerId}")
    public Map<String, Object> getRestaurantByOwnerId(@PathVariable Long ownerId) {
        Restaurant restaurant = restaurantRepository.findAll().stream()
            .filter(r -> r.getOwner() != null && r.getOwner().getId().equals(ownerId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Restaurant not found for owner"));
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", restaurant.getId());
        result.put("name", restaurant.getName());
        result.put("address", restaurant.getAddress());
        result.put("phone", restaurant.getPhone());
        result.put("cuisineType", restaurant.getCuisineType());
        result.put("description", restaurant.getDescription());
        result.put("openingHours", restaurant.getOpeningHours());
        result.put("slug", restaurant.getSlug());
        result.put("isActive", restaurant.getIsActive());
        if (restaurant.getOwner() != null) {
            Map<String, Object> owner = new java.util.HashMap<>();
            owner.put("id", restaurant.getOwner().getId());
            owner.put("username", restaurant.getOwner().getUsername());
            owner.put("email", restaurant.getOwner().getEmail());
            owner.put("role", restaurant.getOwner().getRole());
            result.put("owner", owner);
        } else {
            result.put("owner", null);
        }
        return result;
    }

    @GetMapping("/{id}/menu")
    public List<MenuItem> getMenuForRestaurant(@PathVariable Long id) {
        return menuItemRepository.findByRestaurantId(id);
    }

    @GetMapping("/{id}/orders")
    public List<Map<String, Object>> getOrdersForRestaurant(@PathVariable Long id) {
        return orderRepository.findAll().stream()
            .filter(o -> o.getRestaurantId().equals(id))
            .map(o -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", o.getId());
                map.put("userId", o.getUserId());
                map.put("restaurantId", o.getRestaurantId());
                map.put("status", o.getStatus());
                map.put("total", o.getTotal());
                map.put("items", o.getItems());
                // Add customer name
                String customerName = "";
                if (o.getUserId() != null) {
                    var custOpt = customerRepository.findById(o.getUserId());
                    if (custOpt.isPresent()) customerName = custOpt.get().getUsername();
                }
                map.put("customerName", customerName);
                return map;
            })
            .toList();
    }

    @GetMapping("/{id}/reviews")
    public List<Review> getReviewsForRestaurant(@PathVariable Long id) {
        return reviewRepository.findByRestaurantId(id);
    }

    @PostMapping
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant, @AuthenticationPrincipal UserDetails userDetails) {
        // Set owner from authenticated user
        if (restaurant.getOwner() == null && userDetails != null) {
            com.example.demo.model.User owner = customerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
            restaurant.setOwner(owner);
        }
        // Auto-generate slug if not provided
        if (restaurant.getSlug() == null || restaurant.getSlug().isEmpty()) {
            String baseSlug = slugify(restaurant.getName());
            String uniqueSlug = baseSlug;
            int count = 1;
            while (restaurantRepository.findBySlug(uniqueSlug).isPresent()) {
                uniqueSlug = baseSlug + "-" + count;
                count++;
            }
            restaurant.setSlug(uniqueSlug);
        }
        return restaurantRepository.save(restaurant);
    }

    @PutMapping("/{id}")
    public Restaurant updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurantDetails, @AuthenticationPrincipal UserDetails userDetails) {
        Restaurant restaurant = restaurantRepository.findById(id).orElseThrow();
        // Do not allow owner change, always keep the owner as is
        restaurant.setName(restaurantDetails.getName());
        restaurant.setAddress(restaurantDetails.getAddress());
        restaurant.setPhone(restaurantDetails.getPhone());
        restaurant.setCuisineType(restaurantDetails.getCuisineType());
        restaurant.setDescription(restaurantDetails.getDescription());
        restaurant.setOpeningHours(restaurantDetails.getOpeningHours());
        restaurant.setIsActive(restaurantDetails.getIsActive());
        // Update slug if name changes or slug is missing
        if (restaurantDetails.getSlug() == null || restaurantDetails.getSlug().isEmpty() || !restaurant.getName().equals(restaurantDetails.getName())) {
            String baseSlug = slugify(restaurantDetails.getName());
            String uniqueSlug = baseSlug;
            int count = 1;
            while (restaurantRepository.findBySlug(uniqueSlug).isPresent() && !restaurant.getSlug().equals(uniqueSlug)) {
                uniqueSlug = baseSlug + "-" + count;
                count++;
            }
            restaurant.setSlug(uniqueSlug);
        }
        return restaurantRepository.save(restaurant);
    }

    @PostMapping("/{id}/menu")
    public ResponseEntity<?> addMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem, @AuthenticationPrincipal UserDetails userDetails) {
        Restaurant restaurant = restaurantRepository.findById(id).orElseThrow(() -> new RuntimeException("Restaurant not found"));
        // Only owner can add
        if (restaurant.getOwner() == null || !restaurant.getOwner().getUsername().equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        menuItem.setRestaurant(restaurant);
        MenuItem saved = menuItemRepository.save(menuItem);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{restaurantId}/menu/{menuItemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long restaurantId, @PathVariable Long menuItemId, @AuthenticationPrincipal UserDetails userDetails) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found"));
        MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(() -> new RuntimeException("Menu item not found"));
        // Only owner can delete
        if (restaurant.getOwner() == null || !restaurant.getOwner().getUsername().equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
            return ResponseEntity.status(400).body("Menu item does not belong to this restaurant");
        }
        menuItemRepository.delete(menuItem);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public void deleteRestaurant(@PathVariable Long id) {
        restaurantRepository.deleteById(id);
    }

    // Helper method to slugify a string
    private String slugify(String input) {
        String nowhitespace = Pattern.compile("\\s").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^a-zA-Z0-9-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase();
    }
} 