# Foodly Database Setup

This directory contains database bootstrap scripts for the Foodly application.
Flyway migrations in `backend/src/main/resources/db/migration` are the
authoritative schema history for application-managed databases.

## Files

- `neon-setup.sql` - Neon PostgreSQL specific setup (extensions, functions, etc.)
- `migration.sql` - Docker entrypoint bootstrap for brand-new local PostgreSQL volumes, kept in sync with the current Flyway schema
- `validate-staging.sh` - Current release gate for staging database validation before production
- `STAGING_VALIDATION.md` - Step-by-step staging validation and production release checklist
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
2. The database will be automatically initialized with `database/migration.sql`
3. The backend still runs Flyway on startup for future additive migrations

### Production (Neon PostgreSQL)
1. Create a Neon PostgreSQL database
2. Run the backend with Flyway enabled so migrations apply in order
3. Use `migration.sql` only for fresh manual bootstraps when Flyway cannot create the schema itself

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
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
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
3. Run `./database/validate-staging.sh` against staging after Flyway applies migrations
4. Use Flyway migrations for schema changes; do not edit applied migration files 
