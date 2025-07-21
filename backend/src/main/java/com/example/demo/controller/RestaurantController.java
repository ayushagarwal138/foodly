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

    @GetMapping("/{id}/analytics")
    public Map<String, Object> getAnalytics(@PathVariable Long id) {
        Map<String, Object> analytics = new java.util.HashMap<>();
        // Orders for this restaurant
        List<Order> orders = orderRepository.findAll().stream()
            .filter(o -> o.getRestaurantId().equals(id)).toList();
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
        List<Review> reviews = reviewRepository.findByRestaurantId(id);
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
        // Recent reviews
        analytics.put("recentReviews", reviews.stream().sorted((a,b)->b.getCreatedAt().compareTo(a.getCreatedAt())).limit(5).toList());
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