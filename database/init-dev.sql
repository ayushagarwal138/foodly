-- Development Database Initialization
-- This script adds sample data for development and testing

-- Insert sample users
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$rAM0QwqXqXqXqXqXqXqXqOqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'admin@foodly.com', 'ADMIN'),
('customer1', '$2a$10$rAM0QwqXqXqXqXqXqXqXqOqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'customer1@example.com', 'CUSTOMER'),
('restaurant1', '$2a$10$rAM0QwqXqXqXqXqXqXqXqOqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'restaurant1@example.com', 'RESTAURANT')
ON CONFLICT (username) DO NOTHING;

-- Insert sample restaurants
INSERT INTO restaurants (name, address, phone, cuisine_type, description, opening_hours, slug, owner_id) VALUES
('Pizza Palace', '123 Main St, City', '+1-555-0123', 'Italian', 'Best pizza in town!', '10:00-22:00', 'pizza-palace', 3),
('Burger House', '456 Oak Ave, City', '+1-555-0456', 'American', 'Juicy burgers and fries', '11:00-23:00', 'burger-house', 3),
('Sushi Express', '789 Pine Rd, City', '+1-555-0789', 'Japanese', 'Fresh sushi and sashimi', '12:00-21:00', 'sushi-express', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (name, price, category, veg, restaurant_id) VALUES
('Margherita Pizza', 12.99, 'Pizza', true, 1),
('Pepperoni Pizza', 14.99, 'Pizza', false, 1),
('Classic Burger', 9.99, 'Burgers', false, 2),
('Veggie Burger', 8.99, 'Burgers', true, 2),
('California Roll', 6.99, 'Sushi', true, 3),
('Salmon Nigiri', 4.99, 'Sushi', false, 3)
ON CONFLICT DO NOTHING;

-- Insert sample offers
INSERT INTO offers (type, title, description, discount, max_discount, code, valid_until, min_order, category, restaurant, is_active) VALUES
('discount', 'New User Discount', 'Get 20% off on your first order', '20% OFF', '₹100', 'NEWUSER20', '2024-12-31 23:59:59', '₹200', 'new-user', 'All Restaurants', true),
('free-delivery', 'Free Delivery', 'Free delivery on orders above ₹500', 'FREE DELIVERY', '₹50', 'FREEDEL', '2024-12-31 23:59:59', '₹500', 'delivery', 'All Restaurants', true),
('discount', 'Pizza Special', 'Buy 1 Get 1 Free on all pizzas', 'BOGO', '₹15', 'PIZZABOGO', '2024-12-31 23:59:59', '₹300', 'pizza', 'Pizza Palace', true)
ON CONFLICT (code) DO NOTHING; 