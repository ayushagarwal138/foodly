package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private CustomerRepository customerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User customer = customerRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        // Add ROLE_ prefix for Spring Security and ensure role is uppercase
        String role = customer.getRole() != null ? customer.getRole().toUpperCase() : "CUSTOMER";
        return new org.springframework.security.core.userdetails.User(
                customer.getUsername(),
                customer.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }
} 