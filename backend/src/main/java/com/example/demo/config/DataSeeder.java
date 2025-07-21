package com.example.demo.config;

import com.example.demo.model.MenuItem;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.model.Wishlist;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.WishlistRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    public CommandLineRunner seedData(
            RestaurantRepository restaurantRepo, 
            MenuItemRepository menuItemRepo,
            CustomerRepository customerRepo,
            WishlistRepository wishlistRepo,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Create default admin user
            if (customerRepo.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@foodly.com");
                admin.setRole("ADMIN");
                customerRepo.save(admin);
                System.out.println("Default admin user created: username=admin, password=admin123");
            }
            // Create default restaurant user
            if (customerRepo.findByUsername("restaurant").isEmpty()) {
                User restaurantUser = new User();
                restaurantUser.setUsername("restaurant");
                restaurantUser.setPassword(passwordEncoder.encode("restaurant123"));
                restaurantUser.setEmail("restaurant@foodly.com");
                restaurantUser.setRole("RESTAURANT");
                customerRepo.save(restaurantUser);
                System.out.println("Default restaurant user created: username=restaurant, password=restaurant123");
            }

            // Create sample restaurants for testing
            if (restaurantRepo.count() == 0) {
                Restaurant r1 = new Restaurant();
                r1.setName("Pizza Palace");
                r1.setAddress("123 Main St");
                r1.setPhone("555-1234");
                r1.setCuisineType("Italian");
                r1.setDescription("Best pizza in town!");
                r1.setOpeningHours("10:00 AM - 10:00 PM");
                r1.setIsActive(true);
                // Assign owner to restaurant
                customerRepo.findByUsername("restaurant").ifPresent(r1::setOwner);
                restaurantRepo.save(r1);

                Restaurant r2 = new Restaurant();
                r2.setName("Sushi Central");
                r2.setAddress("456 Ocean Ave");
                r2.setPhone("555-5678");
                r2.setCuisineType("Japanese");
                r2.setDescription("Fresh sushi and sashimi");
                r2.setOpeningHours("11:00 AM - 11:00 PM");
                r2.setIsActive(true);
                restaurantRepo.save(r2);

                MenuItem m1 = new MenuItem();
                m1.setName("Pepperoni Pizza");
                m1.setPrice(12.99);
                m1.setRestaurant(r1);
                menuItemRepo.save(m1);

                MenuItem m2 = new MenuItem();
                m2.setName("Veggie Pizza");
                m2.setPrice(10.99);
                m2.setRestaurant(r1);
                menuItemRepo.save(m2);

                MenuItem m3 = new MenuItem();
                m3.setName("California Roll");
                m3.setPrice(8.99);
                m3.setRestaurant(r2);
                menuItemRepo.save(m3);

                MenuItem m4 = new MenuItem();
                m4.setName("Salmon Nigiri");
                m4.setPrice(11.99);
                m4.setRestaurant(r2);
                menuItemRepo.save(m4);
            }

            // Add sample wishlist data for demo users
            if (customerRepo.count() > 0 && restaurantRepo.count() > 0) {
                User demoUser = customerRepo.findAll().get(0);
                Restaurant demoRestaurant = restaurantRepo.findAll().get(0);
                Wishlist wishlistRestaurant = new Wishlist();
                wishlistRestaurant.setCustomer(demoUser);
                wishlistRestaurant.setType("RESTAURANT");
                wishlistRestaurant.setName(demoRestaurant.getName());
                wishlistRestaurant.setRestaurant(demoRestaurant.getName());
                wishlistRestaurant.setRestaurantId(demoRestaurant.getId());
                wishlistRepo.save(wishlistRestaurant);
            }
        };
    }
} 