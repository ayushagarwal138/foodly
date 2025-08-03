package com.example.demo.controller;

import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
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
    public List<Map<String, Object>> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
            .map(restaurant -> {
                Map<String, Object> result = new java.util.HashMap<>();
                result.put("id", restaurant.getId());
                result.put("name", restaurant.getName());
                result.put("address", restaurant.getAddress());
                result.put("phone", restaurant.getPhone());
                result.put("cuisine", restaurant.getCuisineType()); // Map cuisineType to cuisine
                result.put("description", restaurant.getDescription());
                result.put("openingHours", restaurant.getOpeningHours());
                result.put("slug", restaurant.getSlug());
                result.put("isActive", restaurant.getIsActive());
                result.put("rating", 4.5); // Default rating for demo
                result.put("reviewCount", 10); // Default review count for demo
                result.put("eta", 30); // Default delivery time for demo
                return result;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}")
    public Map<String, Object> getRestaurantById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        // For restaurant owners, verify they own this restaurant
        if (userDetails != null) {
            User authenticatedUser = customerRepository.findByUsername(userDetails.getUsername())
                .orElse(null);
            
            if (authenticatedUser != null && "RESTAURANT".equals(authenticatedUser.getRole())) {
                Restaurant restaurant = restaurantRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Restaurant not found"));
                
                if (!restaurant.getOwner().getId().equals(authenticatedUser.getId())) {
                    throw new RuntimeException("Access denied. You can only view your own restaurant.");
                }
            }
        }
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", restaurant.getId());
        result.put("name", restaurant.getName());
        result.put("address", restaurant.getAddress());
        result.put("phone", restaurant.getPhone());
        result.put("cuisine", restaurant.getCuisineType()); // Map cuisineType to cuisine
        result.put("description", restaurant.getDescription());
        result.put("openingHours", restaurant.getOpeningHours());
        result.put("slug", restaurant.getSlug());
        result.put("isActive", restaurant.getIsActive());
        result.put("rating", 4.5); // Default rating for demo
        result.put("reviewCount", 10); // Default review count for demo
        result.put("eta", 30); // Default delivery time for demo
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
            Restaurant r = restaurant.get();
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("id", r.getId());
            result.put("name", r.getName());
            result.put("address", r.getAddress());
            result.put("phone", r.getPhone());
            result.put("cuisine", r.getCuisineType()); // Map cuisineType to cuisine
            result.put("description", r.getDescription());
            result.put("openingHours", r.getOpeningHours());
            result.put("slug", r.getSlug());
            result.put("isActive", r.getIsActive());
            result.put("rating", 4.5); // Default rating for demo
            result.put("reviewCount", 10); // Default review count for demo
            result.put("eta", 30); // Default delivery time for demo
            // Owner details
            if (r.getOwner() != null) {
                Map<String, Object> owner = new java.util.HashMap<>();
                owner.put("id", r.getOwner().getId());
                owner.put("username", r.getOwner().getUsername());
                owner.put("email", r.getOwner().getEmail());
                owner.put("role", r.getOwner().getRole());
                result.put("owner", owner);
            } else {
                result.put("owner", null);
            }
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(404).body("Restaurant not found");
        }
    }

    @GetMapping("/by-owner/{ownerId}")
    public Map<String, Object> getRestaurantByOwnerId(@PathVariable Long ownerId, @AuthenticationPrincipal UserDetails userDetails) {
        // Verify that the authenticated user is requesting their own restaurant
        User authenticatedUser = customerRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!authenticatedUser.getId().equals(ownerId)) {
            throw new RuntimeException("Access denied. You can only view your own restaurant.");
        }
        System.out.println("=== Restaurant Profile Debug ===");
        System.out.println("Requested owner ID: " + ownerId);
        
        Restaurant restaurant = restaurantRepository.findAll().stream()
            .filter(r -> r.getOwner() != null && r.getOwner().getId().equals(ownerId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Restaurant not found for owner"));
        
        System.out.println("Found restaurant: " + restaurant.getName() + " (ID: " + restaurant.getId() + ")");
        System.out.println("Restaurant owner: " + (restaurant.getOwner() != null ? restaurant.getOwner().getUsername() : "NULL"));
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", restaurant.getId());
        result.put("name", restaurant.getName());
        result.put("address", restaurant.getAddress());
        result.put("phone", restaurant.getPhone());
        result.put("cuisine", restaurant.getCuisineType()); // Map cuisineType to cuisine
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
        
        System.out.println("Restaurant profile returned successfully");
        return result;
    }

    @GetMapping("/{id}/menu")
    public List<MenuItem> getMenuForRestaurant(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        // Verify that the authenticated user owns this restaurant
        User authenticatedUser = customerRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        if (!restaurant.getOwner().getId().equals(authenticatedUser.getId())) {
            throw new RuntimeException("Access denied. You can only view menu for your own restaurant.");
        }
        return menuItemRepository.findByRestaurantId(id);
    }

    @GetMapping("/{id}/menu/customer")
    public List<MenuItem> getMenuForCustomer(@PathVariable Long id) {
        // For customers, only show available items
        return menuItemRepository.findByRestaurantId(id).stream()
            .filter(item -> item.getIsAvailable() != null && item.getIsAvailable())
            .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/{id}/orders")
    public List<Map<String, Object>> getOrdersForRestaurant(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        // Verify that the authenticated user owns this restaurant
        User authenticatedUser = customerRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        if (!restaurant.getOwner().getId().equals(authenticatedUser.getId())) {
            throw new RuntimeException("Access denied. You can only view orders for your own restaurant.");
        }
        return orderRepository.findAll().stream()
            .filter(o -> o.getRestaurantId().equals(id))
            .sorted((a, b) -> b.getId().compareTo(a.getId())) // Sort by ID descending (latest first)
            .map(o -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", o.getId());
                map.put("userId", o.getUserId());
                map.put("restaurantId", o.getRestaurantId());
                map.put("status", o.getStatus());
                map.put("total", o.getTotal());
                map.put("items", o.getItems());
                map.put("createdAt", o.getId()); // Add createdAt for consistency
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
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(id);
    }

    @GetMapping("/{id}/analytics")
    public Map<String, Object> getAnalytics(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        // Verify that the authenticated user owns this restaurant
        User authenticatedUser = customerRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        
        if (!restaurant.getOwner().getId().equals(authenticatedUser.getId())) {
            throw new RuntimeException("Access denied. You can only view analytics for your own restaurant.");
        }
        Map<String, Object> analytics = new java.util.HashMap<>();
        // Orders for this restaurant (sorted by latest first)
        List<Order> orders = orderRepository.findAll().stream()
            .filter(o -> o.getRestaurantId().equals(id))
            .sorted((a, b) -> b.getId().compareTo(a.getId())) // Sort by ID descending (latest first)
            .toList();
        analytics.put("totalOrders", orders.size());
        // Orders by status
        Map<String, Long> ordersByStatus = orders.stream().collect(
            java.util.stream.Collectors.groupingBy(Order::getStatus, java.util.stream.Collectors.counting()));
        analytics.put("ordersByStatus", ordersByStatus);
        // Order trends (last 30 days)
        java.time.LocalDate today = java.time.LocalDate.now();
        Map<String, Long> orderTrends = new java.util.LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            java.time.LocalDate day = today.minusDays(i);
            long count = orders.stream().filter(o -> {
                java.util.Date createdAt = null;
                if (o instanceof Map m && m.containsKey("createdAt")) {
                    createdAt = (java.util.Date) m.get("createdAt");
                } else if (o.getClass().getDeclaredFields() != null) {
                    try {
                        var f = o.getClass().getDeclaredField("createdAt");
                        f.setAccessible(true);
                        createdAt = (java.util.Date) f.get(o);
                    } catch (Exception ignored) {}
                }
                if (createdAt == null) return false;
                java.time.LocalDate orderDate = createdAt.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                return orderDate.equals(day);
            }).count();
            orderTrends.put(day.toString(), count);
        }
        analytics.put("orderTrends", orderTrends);
        // Revenue
        double totalRevenue = orders.stream().mapToDouble(Order::getTotal).sum();
        analytics.put("totalRevenue", totalRevenue);
        // Revenue trends (last 30 days)
        Map<String, Double> revenueTrends = new java.util.LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            java.time.LocalDate day = today.minusDays(i);
            double sum = orders.stream().filter(o -> {
                java.util.Date createdAt = null;
                if (o instanceof Map m && m.containsKey("createdAt")) {
                    createdAt = (java.util.Date) m.get("createdAt");
                } else if (o.getClass().getDeclaredFields() != null) {
                    try {
                        var f = o.getClass().getDeclaredField("createdAt");
                        f.setAccessible(true);
                        createdAt = (java.util.Date) f.get(o);
                    } catch (Exception ignored) {}
                }
                if (createdAt == null) return false;
                java.time.LocalDate orderDate = createdAt.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                return orderDate.equals(day);
            }).mapToDouble(Order::getTotal).sum();
            revenueTrends.put(day.toString(), sum);
        }
        analytics.put("revenueTrends", revenueTrends);
        // Menu performance
        List<MenuItem> menuItems = menuItemRepository.findByRestaurantId(id);
        Map<String, Integer> dishSales = new java.util.HashMap<>();
        for (MenuItem item : menuItems) {
            int count = 0;
            for (Order o : orders) {
                if (o.getItems() != null) {
                    for (var oi : o.getItems()) {
                        if (oi.getMenuItemId() != null && oi.getMenuItemId().equals(item.getId())) {
                            count += oi.getQuantity();
                        }
                    }
                }
            }
            dishSales.put(item.getName(), count);
        }
        analytics.put("dishSales", dishSales);
        // Top/least selling dishes
        analytics.put("topDishes", dishSales.entrySet().stream().sorted((a,b)->b.getValue()-a.getValue()).limit(5).toList());
        analytics.put("leastDishes", dishSales.entrySet().stream().sorted(java.util.Map.Entry.comparingByValue()).limit(5).toList());
        // Average rating per dish
        List<Review> reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(id);
        Map<String, Double> avgRatingPerDish = new java.util.HashMap<>();
        for (MenuItem item : menuItems) {
            var relevant = reviews.stream().filter(r -> r.getMenuItemId()!=null && r.getMenuItemId().equals(item.getId())).toList();
            double avg = relevant.isEmpty() ? 0 : relevant.stream().mapToInt(Review::getRating).average().orElse(0);
            avgRatingPerDish.put(item.getName(), avg);
        }
        analytics.put("avgRatingPerDish", avgRatingPerDish);
        // Customer stats
        java.util.Set<Long> uniqueCustomers = new java.util.HashSet<>();
        java.util.Map<Long, Integer> customerOrderCounts = new java.util.HashMap<>();
        for (Order o : orders) {
            uniqueCustomers.add(o.getUserId());
            customerOrderCounts.put(o.getUserId(), customerOrderCounts.getOrDefault(o.getUserId(), 0) + 1);
        }
        analytics.put("uniqueCustomers", uniqueCustomers.size());
        analytics.put("repeatCustomers", customerOrderCounts.values().stream().filter(c -> c > 1).count());
        // Recent reviews (already sorted by createdAt desc from repository)
        analytics.put("recentReviews", reviews.stream().limit(5).toList());
        analytics.put("averageRating", reviews.isEmpty() ? 0 : reviews.stream().mapToInt(Review::getRating).average().orElse(0));
        return analytics;
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
        // No need to manually set category/veg, already bound from request body
        MenuItem saved = menuItemRepository.save(menuItem);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{restaurantId}/menu/{menuItemId}/can-delete")
    public ResponseEntity<?> canDeleteMenuItem(@PathVariable Long restaurantId, @PathVariable Long menuItemId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found"));
            MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(() -> new RuntimeException("Menu item not found"));
            
            // Only owner can check
            if (restaurant.getOwner() == null || !restaurant.getOwner().getUsername().equals(userDetails.getUsername())) {
                return ResponseEntity.status(403).body("Forbidden");
            }
            if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
                return ResponseEntity.status(400).body("Menu item does not belong to this restaurant");
            }
            
            // Check for references in other tables
            boolean hasOrderItems = orderRepository.findAll().stream()
                .anyMatch(order -> order.getItems().stream()
                    .anyMatch(item -> item.getMenuItemId().equals(menuItemId)));
            boolean hasReviews = reviewRepository.findByMenuItemId(menuItemId).size() > 0;
            boolean hasWishlist = false; // You might need to add this repository method
            boolean hasCart = false; // You might need to add this repository method
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("canDelete", !hasOrderItems && !hasReviews && !hasWishlist && !hasCart);
            result.put("hasOrderItems", hasOrderItems);
            result.put("hasReviews", hasReviews);
            result.put("hasWishlist", hasWishlist);
            result.put("hasCart", hasCart);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to check menu item: " + e.getMessage());
        }
    }

    @PatchMapping("/{restaurantId}/menu/{menuItemId}/availability")
    public ResponseEntity<?> updateMenuItemAvailability(@PathVariable Long restaurantId, @PathVariable Long menuItemId, 
                                                       @RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found"));
            MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(() -> new RuntimeException("Menu item not found"));
            
            // Only owner can update
            if (restaurant.getOwner() == null || !restaurant.getOwner().getUsername().equals(userDetails.getUsername())) {
                return ResponseEntity.status(403).body("Forbidden");
            }
            if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
                return ResponseEntity.status(400).body("Menu item does not belong to this restaurant");
            }
            
            // Update availability fields
            if (request.containsKey("isAvailable")) {
                menuItem.setIsAvailable((Boolean) request.get("isAvailable"));
            }
            if (request.containsKey("quantityAvailable")) {
                menuItem.setQuantityAvailable((Integer) request.get("quantityAvailable"));
            }
            if (request.containsKey("showQuantity")) {
                menuItem.setShowQuantity((Boolean) request.get("showQuantity"));
            }
            
            MenuItem updated = menuItemRepository.save(menuItem);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update menu item availability: " + e.getMessage());
        }
    }

    @DeleteMapping("/{restaurantId}/menu/{menuItemId}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long restaurantId, @PathVariable Long menuItemId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found"));
            MenuItem menuItem = menuItemRepository.findById(menuItemId).orElseThrow(() -> new RuntimeException("Menu item not found"));
            // Only owner can delete
            if (restaurant.getOwner() == null || !restaurant.getOwner().getUsername().equals(userDetails.getUsername())) {
                return ResponseEntity.status(403).body("Forbidden");
            }
            if (!menuItem.getRestaurant().getId().equals(restaurantId)) {
                return ResponseEntity.status(400).body("Menu item does not belong to this restaurant");
            }
            
            // Double-check if it can be deleted before attempting
            boolean hasOrderItems = orderRepository.findAll().stream()
                .anyMatch(order -> order.getItems().stream()
                    .anyMatch(item -> item.getMenuItemId().equals(menuItemId)));
            boolean hasReviews = reviewRepository.findByMenuItemId(menuItemId).size() > 0;
            
            if (hasOrderItems || hasReviews) {
                return ResponseEntity.status(409).body("Cannot delete menu item: It is referenced by existing orders or reviews. Please remove these references first.");
            }
            
            menuItemRepository.delete(menuItem);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Check if it's a constraint violation
            if (e.getMessage() != null && e.getMessage().contains("constraint")) {
                return ResponseEntity.status(409).body("Cannot delete menu item: It is referenced by existing orders, reviews, or cart items. Please remove these references first.");
            }
            return ResponseEntity.status(500).body("Failed to delete menu item: " + e.getMessage());
        }
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