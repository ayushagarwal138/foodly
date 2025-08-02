# Foodly Database Setup

This directory contains the database setup scripts for the Foodly application.

## Files

- `neon-setup.sql` - Neon PostgreSQL specific setup (extensions, functions, etc.)
- `migration.sql` - Complete database migration script with all tables, triggers, and indexes
- `README.md` - This documentation file

## Database Schema

The Foodly application uses PostgreSQL with the following main entities:

### Core Tables
- **users** - Customers, restaurant owners, and admins
- **restaurants** - Restaurant information and details
- **menu_items** - Food items available at restaurants
- **orders** - Customer orders
- **order_items** - Individual items within orders
- **reviews** - Customer reviews and ratings
- **wishlist** - Customer saved restaurants and dishes
- **cart** - Customer shopping cart
- **offers** - Promotional offers and coupons
- **chat_messages** - Customer support and order communication

### Key Features
- **Timestamps** - All tables include `created_at` and `updated_at` fields
- **Triggers** - Automatic `updated_at` timestamp updates
- **Indexes** - Optimized for common query patterns
- **Foreign Keys** - Proper referential integrity
- **Soft Deletes** - Where appropriate (e.g., `is_active` flags)

## Setup Instructions

### Local Development (Docker)
1. Use the `docker-compose.yml` in the root directory
2. The database will be automatically initialized with `schema.sql`

### Production (Neon PostgreSQL)
1. Create a Neon PostgreSQL database
2. Run `neon-setup.sql` first for extensions and functions
3. Run `migration.sql` for complete schema setup

### Manual Setup
```bash
# Connect to your PostgreSQL database
psql -h your-host -U your-user -d your-database

# Run the migration script
\i database/migration.sql
```

## Environment Variables

Configure these environment variables for database connection:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/database
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

## Performance Considerations

- All foreign key columns are indexed
- Common query fields (username, email, status, etc.) are indexed
- Composite indexes for frequently joined tables
- Triggers for automatic timestamp updates

## Backup and Migration

For production deployments:
1. Always backup existing data before running migrations
2. Test migrations in a staging environment first
3. Use `CREATE TABLE IF NOT EXISTS` for safe migrations
4. Consider using a proper migration tool like Flyway or Liquibase for complex deployments 