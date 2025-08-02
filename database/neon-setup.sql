-- Neon Database Setup for Foodly Application
-- This script sets up the initial database structure for Neon PostgreSQL

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a dedicated user for the application (optional)
-- CREATE USER foodly_user WITH PASSWORD 'your_secure_password';

-- Grant necessary permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO foodly_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO foodly_user;

-- Note: The actual table creation will be handled by Spring Boot JPA with hibernate.ddl-auto=update
-- This script is for Neon-specific setup and extensions only

-- For Neon, you may want to set up connection pooling
-- ALTER SYSTEM SET max_connections = 100;
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: You can create triggers for updated_at columns if needed
-- Example:
-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 