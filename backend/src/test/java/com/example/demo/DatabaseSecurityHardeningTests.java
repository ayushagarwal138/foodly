package com.example.demo;

import com.example.demo.controller.AuthController;
import com.example.demo.controller.CustomerController;
import com.example.demo.controller.OrderController;
import com.example.demo.controller.RestaurantController;
import com.example.demo.controller.ReviewController;
import com.example.demo.controller.SupportController;
import com.example.demo.dto.SignupRequest;
import com.example.demo.exception.ApiException;
import com.example.demo.model.ChatMessage;
import com.example.demo.model.MenuItem;
import com.example.demo.model.Order;
import com.example.demo.model.OrderItem;
import com.example.demo.model.Restaurant;
import com.example.demo.model.User;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.ChatMessageRepository;
import com.example.demo.repository.MenuItemRepository;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.RestaurantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class DatabaseSecurityHardeningTests {
    @Autowired
    private AuthController authController;
    @Autowired
    private CustomerController customerController;
    @Autowired
    private OrderController orderController;
    @Autowired
    private SupportController supportController;
    @Autowired
    private ReviewController reviewController;
    @Autowired
    private RestaurantController restaurantController;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private RestaurantRepository restaurantRepository;
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private MenuItemRepository menuItemRepository;
    @Autowired
    private OrderRepository orderRepository;

    @Test
    void publicSignupCannotCreateAdmin() {
        SignupRequest request = new SignupRequest();
        request.setUsername("public_admin");
        request.setEmail("public-admin@example.com");
        request.setPassword("SecurePass123!");
        request.setRole("ADMIN");

        assertThatThrownBy(() -> authController.signup(request))
            .isInstanceOf(ApiException.class)
            .hasMessageContaining("Admin accounts cannot be created");
        assertThat(customerRepository.findByUsername("public_admin")).isEmpty();
    }

    @Test
    void publicSignupIssuesAuthCookieForCustomer() {
        SignupRequest request = new SignupRequest();
        request.setUsername("new_customer");
        request.setEmail("new-customer@example.com");
        request.setPassword("SecurePass123!");
        request.setRole("CUSTOMER");

        ResponseEntity<Map<String, Object>> response = authController.signup(request);

        assertThat(response.getHeaders().getFirst(HttpHeaders.SET_COOKIE)).contains("FOODLY_ACCESS_TOKEN");
        assertThat(response.getBody()).containsEntry("role", "CUSTOMER");
        assertThat(response.getBody()).containsEntry("username", "new_customer");
    }

    @Test
    void restaurantSignupCreatesBrowsableSlug() {
        SignupRequest request = new SignupRequest();
        request.setUsername("dhaba_owner");
        request.setEmail("dhaba-owner@example.com");
        request.setPassword("SecurePass123!");
        request.setRole("RESTAURANT");
        request.setRestaurantName("Dhaba Kitchen");
        request.setRestaurantAddress("Market Road");
        request.setRestaurantPhone("1234567890");
        request.setCuisineType("Indian");

        ResponseEntity<Map<String, Object>> signupResponse = authController.signup(request);

        Long restaurantId = ((Number) signupResponse.getBody().get("restaurantId")).longValue();
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow();
        assertThat(restaurant.getSlug()).isEqualTo("dhaba-kitchen");

        ResponseEntity<?> slugResponse = restaurantController.getRestaurantBySlug("dhaba-kitchen");
        ResponseEntity<?> idResponse = restaurantController.getRestaurantBySlug(restaurantId.toString());

        assertThat(slugResponse.getStatusCode().value()).isEqualTo(200);
        assertThat(idResponse.getStatusCode().value()).isEqualTo(200);
    }

    @Test
    void customerProfileIsSafeAndSelfScoped() {
        User alice = saveUser("alice", "alice@example.com", "CUSTOMER");
        User bob = saveUser("bob", "bob@example.com", "CUSTOMER");

        Map<String, Object> profile = customerController.getCustomerById(alice.getId(), principal(alice));

        assertThat(profile).containsEntry("id", alice.getId());
        assertThat(profile).containsEntry("email", "alice@example.com");
        assertThat(profile).doesNotContainKeys("password", "providerSubject");
        assertThatThrownBy(() -> customerController.getCustomerById(bob.getId(), principal(alice)))
            .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void orderPlacementUsesDatabaseValuesAndCommitsInventoryAtomically() {
        User customer = saveUser("buyer", "buyer@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant("Owner", "owner@example.com", "Pizza Place");
        MenuItem item = saveMenuItem(restaurant, "Real Pizza", 12.50, true, 5);

        Map<String, Object> response = orderController.placeOrder(Map.of(
            "items", List.of(Map.of(
                "menu_item_id", item.getId(),
                "name", "Tampered Name",
                "price", 0,
                "qty", 2,
                "restaurantId", 99999
            ))
        ), principal(customer));

        assertThat(response).containsEntry("total", 25.0);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
        assertThat(items.get(0)).containsEntry("name", "Real Pizza");
        assertThat(items.get(0)).containsEntry("price", 12.50);
        assertThat(menuItemRepository.findById(item.getId()).orElseThrow().getQuantityAvailable()).isEqualTo(3);
    }

    @Test
    void customersCannotReadOtherCustomersOrdersOrSupportMessages() {
        User owner = saveUser("support_owner", "support-owner@example.com", "RESTAURANT");
        User buyer = saveUser("support_buyer", "support-buyer@example.com", "CUSTOMER");
        User stranger = saveUser("support_stranger", "support-stranger@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant(owner, "Support Cafe");
        MenuItem item = saveMenuItem(restaurant, "Soup", 7.00, true, 10);
        Order order = placePersistedOrder(buyer, item, 1);

        assertThatThrownBy(() -> orderController.getOrderById(order.getId(), principal(stranger)))
            .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> supportController.getMessages(order.getId(), buyer.getId(), restaurant.getId(), principal(stranger)))
            .isInstanceOf(AccessDeniedException.class);

        ChatMessage spoofed = new ChatMessage();
        spoofed.setOrderId(order.getId());
        spoofed.setCustomerId(stranger.getId());
        spoofed.setRestaurantId(999L);
        spoofed.setSender("restaurant");
        spoofed.setMessage("hello");

        ChatMessage saved = supportController.addMessage(spoofed, principal(buyer));
        assertThat(saved.getCustomerId()).isEqualTo(buyer.getId());
        assertThat(saved.getRestaurantId()).isEqualTo(restaurant.getId());
        assertThat(saved.getSender()).isEqualTo("customer");
    }

    @Test
    void customerNotificationsIncludeContextAndDisappearAfterRead() {
        User owner = saveUser("notify_owner", "notify-owner@example.com", "RESTAURANT");
        User buyer = saveUser("notify_buyer", "notify-buyer@example.com", "CUSTOMER");
        User stranger = saveUser("notify_stranger", "notify-stranger@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant(owner, "Notification Cafe");
        MenuItem item = saveMenuItem(restaurant, "Tea", 3.00, true, 10);
        Order order = placePersistedOrder(buyer, item, 1);

        ChatMessage message = new ChatMessage();
        message.setOrderId(order.getId());
        message.setCustomerId(buyer.getId());
        message.setRestaurantId(restaurant.getId());
        message.setSender("restaurant");
        message.setMessage("Your order is almost ready");
        message.setIsRead(false);
        ChatMessage saved = chatMessageRepository.save(message);

        Map<String, Object> notificationResponse = supportController.getUnreadNotifications(principal(buyer));

        assertThat(notificationResponse).containsEntry("unreadCount", 1);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notifications = (List<Map<String, Object>>) notificationResponse.get("notifications");
        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0))
            .containsEntry("messageId", saved.getId())
            .containsEntry("restaurantName", "Notification Cafe")
            .containsEntry("orderId", order.getId())
            .containsEntry("restaurantId", restaurant.getId());
        assertThat((String) notifications.get(0).get("targetPath"))
            .contains("/customer/support")
            .contains("orderId=" + order.getId())
            .contains("restaurantId=" + restaurant.getId());

        assertThat(supportController.getUnreadNotifications(principal(stranger))).containsEntry("unreadCount", 0);

        supportController.markMessageAsRead(saved.getId(), principal(buyer));
        assertThat(supportController.getUnreadNotifications(principal(buyer))).containsEntry("unreadCount", 0);
    }

    @Test
    void restaurantNotificationsIncludeCustomerContextAndDisappearAfterRead() {
        User owner = saveUser("restaurant_notify_owner", "restaurant-notify-owner@example.com", "RESTAURANT");
        User otherOwner = saveUser("restaurant_notify_other", "restaurant-notify-other@example.com", "RESTAURANT");
        User buyer = saveUser("restaurant_notify_buyer", "restaurant-notify-buyer@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant(owner, "Restaurant Notify Cafe");
        saveRestaurant(otherOwner, "Other Notify Cafe");
        MenuItem item = saveMenuItem(restaurant, "Soup", 8.00, true, 10);
        Order order = placePersistedOrder(buyer, item, 1);

        ChatMessage message = new ChatMessage();
        message.setOrderId(order.getId());
        message.setCustomerId(buyer.getId());
        message.setRestaurantId(restaurant.getId());
        message.setSender("customer");
        message.setMessage("Please make it less spicy");
        message.setIsRead(false);
        ChatMessage saved = chatMessageRepository.save(message);

        Map<String, Object> notificationResponse = supportController.getUnreadNotifications(principal(owner));

        assertThat(notificationResponse).containsEntry("unreadCount", 1);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notifications = (List<Map<String, Object>>) notificationResponse.get("notifications");
        assertThat(notifications).hasSize(1);
        assertThat(notifications.get(0))
            .containsEntry("messageId", saved.getId())
            .containsEntry("customerName", buyer.getUsername())
            .containsEntry("restaurantName", "Restaurant Notify Cafe")
            .containsEntry("orderId", order.getId())
            .containsEntry("restaurantId", restaurant.getId());
        assertThat((String) notifications.get(0).get("targetPath"))
            .contains("/restaurant/orders")
            .contains("orderId=" + order.getId());

        assertThat(supportController.getUnreadNotifications(principal(otherOwner))).containsEntry("unreadCount", 0);

        supportController.markMessageAsRead(saved.getId(), principal(owner));
        assertThat(supportController.getUnreadNotifications(principal(owner))).containsEntry("unreadCount", 0);
    }

    @Test
    void restaurantStatusUpdatesCreateCustomerOrderNotifications() {
        User owner = saveUser("status_notify_owner", "status-notify-owner@example.com", "RESTAURANT");
        User buyer = saveUser("status_notify_buyer", "status-notify-buyer@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant(owner, "Status Notify Cafe");
        MenuItem item = saveMenuItem(restaurant, "Pasta", 10.00, true, 10);
        Order order = placePersistedOrder(buyer, item, 1);

        orderController.updateOrderStatus(order.getId(), Map.of("status", "Accepted"), principal(owner));

        Map<String, Object> notificationResponse = supportController.getUnreadNotifications(principal(buyer));
        assertThat(notificationResponse).containsEntry("unreadCount", 1);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notifications = (List<Map<String, Object>>) notificationResponse.get("notifications");
        assertThat(notifications.get(0))
            .containsEntry("type", "ORDER_STATUS")
            .containsEntry("restaurantName", "Status Notify Cafe")
            .containsEntry("orderId", order.getId())
            .containsEntry("orderStatus", "Accepted");
        assertThat((String) notifications.get(0).get("message")).contains("is now Accepted");
        assertThat((String) notifications.get(0).get("targetPath"))
            .isEqualTo("/customer/orders?orderId=" + order.getId());

        orderController.updateOrderStatus(order.getId(), Map.of("status", "Accepted"), principal(owner));
        assertThat(supportController.getUnreadNotifications(principal(buyer))).containsEntry("unreadCount", 1);

        for (String status : List.of("Preparing", "Out for Delivery", "Delivered", "Cancelled", "Refunded", "New")) {
            orderController.updateOrderStatus(order.getId(), Map.of("status", status), principal(owner));
        }
        assertThat(supportController.getUnreadNotifications(principal(buyer))).containsEntry("unreadCount", 7);
    }

    @Test
    void supportHistoryLoadsForClosedOrdersButNewMessagesAreBlocked() {
        User owner = saveUser("closed_owner", "closed-owner@example.com", "RESTAURANT");
        User buyer = saveUser("closed_buyer", "closed-buyer@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant(owner, "Closed Order Cafe");
        MenuItem item = saveMenuItem(restaurant, "Coffee", 5.00, true, 10);
        Order order = placePersistedOrder(buyer, item, 1);
        order.setStatus("Delivered");
        orderRepository.save(order);

        ChatMessage message = new ChatMessage();
        message.setOrderId(order.getId());
        message.setCustomerId(buyer.getId());
        message.setRestaurantId(restaurant.getId());
        message.setSender("restaurant");
        message.setMessage("Thanks for ordering");
        message.setIsRead(false);
        chatMessageRepository.save(message);

        List<ChatMessage> messages = supportController.getMessages(
            order.getId(), buyer.getId(), restaurant.getId(), principal(buyer)
        );

        assertThat(messages).hasSize(1);
        assertThat(messages.get(0).getMessage()).isEqualTo("Thanks for ordering");

        ChatMessage reply = new ChatMessage();
        reply.setOrderId(order.getId());
        reply.setMessage("Can I still reply?");

        assertThatThrownBy(() -> supportController.addMessage(reply, principal(buyer)))
            .isInstanceOf(ApiException.class)
            .hasMessageContaining("Chat is disabled");
    }

    @Test
    void restaurantOwnersCannotReadOtherRestaurantsOrders() {
        User buyer = saveUser("restaurant_buyer", "restaurant-buyer@example.com", "CUSTOMER");
        Restaurant mine = saveRestaurant("mine_owner", "mine-owner@example.com", "Mine");
        Restaurant theirs = saveRestaurant("their_owner", "their-owner@example.com", "Theirs");
        MenuItem item = saveMenuItem(theirs, "Noodles", 9.00, true, 10);
        placePersistedOrder(buyer, item, 1);

        assertThatThrownBy(() -> orderController.getOrdersForRestaurant(theirs.getId(), principal(mine.getOwner())))
            .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void reviewRequiresOrderedItemAndRejectsDuplicateReviews() {
        User buyer = saveUser("review_buyer", "review-buyer@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant("review_owner", "review-owner@example.com", "Review Cafe");
        MenuItem orderedItem = saveMenuItem(restaurant, "Burger", 11.00, true, 10);
        MenuItem otherItem = saveMenuItem(restaurant, "Fries", 4.00, true, 10);
        Order order = placePersistedOrder(buyer, orderedItem, 1);

        assertThatThrownBy(() -> reviewController.createReview(Map.of(
            "orderId", order.getId(),
            "menuItemId", otherItem.getId(),
            "rating", 5,
            "text", "wrong item"
        ), principal(buyer))).isInstanceOf(IllegalArgumentException.class);

        reviewController.createReview(Map.of(
            "orderId", order.getId(),
            "menuItemId", orderedItem.getId(),
            "rating", 5,
            "text", "great"
        ), principal(buyer));

        assertThatThrownBy(() -> reviewController.createReview(Map.of(
            "orderId", order.getId(),
            "menuItemId", orderedItem.getId(),
            "rating", 4,
            "text", "again"
        ), principal(buyer))).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void referencedMenuItemDeletionIsBlocked() {
        User buyer = saveUser("delete_buyer", "delete-buyer@example.com", "CUSTOMER");
        Restaurant restaurant = saveRestaurant("delete_owner", "delete-owner@example.com", "Delete Cafe");
        MenuItem item = saveMenuItem(restaurant, "Toast", 3.00, true, 10);
        placePersistedOrder(buyer, item, 1);

        ResponseEntity<?> response = restaurantController.deleteMenuItem(
            restaurant.getId(), item.getId(), principal(restaurant.getOwner())
        );

        assertThat(response.getStatusCode().value()).isEqualTo(409);
    }

    private User saveUser(String username, String email, String role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword("$2a$10$abcdefghijklmnopqrstuuCJ4CkO0mxfMwrUi7Y3sq7Qo7E7oIb5a");
        user.setRole(role);
        user.setProvider("LOCAL");
        user.setIsBlocked(false);
        return customerRepository.save(user);
    }

    private Restaurant saveRestaurant(String ownerName, String ownerEmail, String restaurantName) {
        return saveRestaurant(saveUser(ownerName, ownerEmail, "RESTAURANT"), restaurantName);
    }

    private Restaurant saveRestaurant(User owner, String restaurantName) {
        Restaurant restaurant = new Restaurant();
        restaurant.setName(restaurantName);
        restaurant.setOwner(owner);
        restaurant.setIsActive(true);
        restaurant.setSlug(restaurantName.toLowerCase().replace(" ", "-"));
        return restaurantRepository.save(restaurant);
    }

    private MenuItem saveMenuItem(Restaurant restaurant, String name, double price, boolean showQuantity, int quantityAvailable) {
        MenuItem item = new MenuItem();
        item.setRestaurant(restaurant);
        item.setName(name);
        item.setPrice(price);
        item.setVeg(true);
        item.setIsAvailable(true);
        item.setShowQuantity(showQuantity);
        item.setQuantityAvailable(quantityAvailable);
        return menuItemRepository.save(item);
    }

    private Order placePersistedOrder(User customer, MenuItem item, int quantity) {
        Order order = new Order();
        order.setUserId(customer.getId());
        order.setRestaurantId(item.getRestaurant().getId());
        order.setStatus("New");
        order.setTotal(item.getPrice() * quantity);

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setMenuItemId(item.getId());
        orderItem.setName(item.getName());
        orderItem.setPrice(item.getPrice());
        orderItem.setQuantity(quantity);
        order.setItems(new ArrayList<>(List.of(orderItem)));
        return orderRepository.save(order);
    }

    private UserDetails principal(User user) {
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password("ignored")
            .roles(user.getRole())
            .build();
    }
}
