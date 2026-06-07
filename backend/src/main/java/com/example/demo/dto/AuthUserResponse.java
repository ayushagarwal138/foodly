package com.example.demo.dto;

public class AuthUserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Long restaurantId;

    public AuthUserResponse(Long id, String username, String email, String role, Long restaurantId) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.restaurantId = restaurantId;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Long getRestaurantId() { return restaurantId; }
}
