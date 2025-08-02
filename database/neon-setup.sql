-- Neon Database Setup for Foodly Application
-- This script sets up the initial database structure

-- Create the database (if not exists)
-- Note: In Neon, you typically create the database through the dashboard
-- This script assumes the database 'foodly_db' already exists

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (these will be created by Hibernate, but here's the structure for reference)
-- The actual table creation will be handled by Spring Boot JPA with hibernate.ddl-auto=update

-- Note: The following is for reference only - Hibernate will create the actual tables
-- based on your JPA entities when the application starts

-- Users table (if needed for initial setup)
-- CREATE TABLE IF NOT EXISTS users (
--     id BIGSERIAL PRIMARY KEY,
--     username VARCHAR(255) UNIQUE NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     role VARCHAR(50) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Add any additional database setup here if needed
-- For example, initial data, indexes, etc.

-- Create indexes for better performance
-- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Grant necessary permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO foodly_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO foodly_user; 