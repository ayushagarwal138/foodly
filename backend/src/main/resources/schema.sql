-- USERS: customers, restaurant owners, admins
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL, -- 'CUSTOMER', 'RESTAURANT', 'ADMIN'
    is_blocked BOOLEAN DEFAULT FALSE, -- Track if user is blocked
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RESTAURANTS: owned by a user with role 'RESTAURANT'
CREATE TABLE restaurants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    cuisine_type VARCHAR(100),
    description TEXT,
    opening_hours VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    slug VARCHAR(255) UNIQUE,
    owner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- MENU ITEMS: belong to a restaurant
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    veg BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    quantity_available INTEGER,
    show_quantity BOOLEAN DEFAULT FALSE,
    restaurant_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ORDERS: placed by a customer, for a restaurant
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL, -- customer
    restaurant_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- ORDER ITEMS: items in an order
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL, -- name of the menu item
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- REVIEWS: left by a customer for an order/restaurant
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_id BIGINT,
    restaurant_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    menu_item_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    text TEXT,
    is_flagged BOOLEAN DEFAULT FALSE, -- Track if review is flagged
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- WISHLIST: customer can wishlist restaurants or dishes
CREATE TABLE wishlist (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'RESTAURANT' or 'DISH'
    name VARCHAR(255) NOT NULL, -- name of restaurant or dish
    restaurant VARCHAR(255), -- restaurant name (for dishes)
    restaurant_id BIGINT,
    menu_item_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- CART: customer cart items
CREATE TABLE cart (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- OFFERS: promotional offers and coupons
CREATE TABLE offers (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'discount', 'free-delivery', 'cashback', 'combo', 'free-item'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount VARCHAR(100), -- e.g., '50% OFF', 'FREE DELIVERY'
    max_discount VARCHAR(50), -- e.g., '₹200'
    code VARCHAR(100) UNIQUE NOT NULL, -- coupon code
    valid_until TIMESTAMP NOT NULL,
    min_order VARCHAR(50), -- e.g., '₹100'
    category VARCHAR(100), -- e.g., 'new-user', 'weekday'
    restaurant VARCHAR(255), -- restaurant name or 'All Restaurants'
    restaurant_id BIGINT, -- null for all restaurants
    image_url TEXT,
    color VARCHAR(100), -- CSS color class
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
);

-- CHAT MESSAGES: for customer support and order communication
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    customer_id BIGINT NOT NULL,
    restaurant_id BIGINT NOT NULL,
    sender VARCHAR(20) NOT NULL, -- 'customer' or 'restaurant'
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE, -- Track if message has been read
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_veg ON menu_items(veg);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item_id ON reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_id ON wishlist(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_type ON wishlist(type);
CREATE INDEX IF NOT EXISTS idx_cart_customer_id ON cart(customer_id);
CREATE INDEX IF NOT EXISTS idx_cart_menu_item_id ON cart(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_offers_code ON offers(code);
CREATE INDEX IF NOT EXISTS idx_offers_restaurant_id ON offers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_offers_valid_until ON offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_order_id ON chat_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_customer_id ON chat_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_restaurant_id ON chat_messages(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp); 