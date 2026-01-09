package com.example.demo.repository;

import com.example.demo.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    Optional<Restaurant> findBySlug(String slug);
    Optional<Restaurant> findByOwner_Id(Long ownerId);
} 