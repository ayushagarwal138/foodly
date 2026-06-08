# Staging Validation Before Production

Use this before deploying Foodly to production. The current release expects Flyway migrations through `V5__order_item_quantity_check.sql`.

## 1. Create Or Select A Staging Database

Use a PostgreSQL database that is separate from production. Do not use your local `foody_staging` database for this step.

The connection URL usually looks like:

```bash
postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
```

For a local PostgreSQL database, omit `sslmode=require` if your local server does not support SSL.

## 2. Deploy Or Start Backend Against Staging

Set the staging backend environment variables, including:

```bash
DATABASE_URL='jdbc:postgresql://HOST:5432/DB?sslmode=require'
DATABASE_USERNAME='USER'
DATABASE_PASSWORD='PASSWORD'
SPRING_FLYWAY_ENABLED=true
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
JWT_SECRET='a-long-secure-staging-secret'
CORS_ALLOWED_ORIGINS='https://your-staging-frontend.example.com'
```

Start the backend. Flyway must apply versions `1`, `2`, `3`, `4`, and `5`.

## 3. Run The Database Gate

From the project root:

```bash
cd /Users/ayushagarwal/Projects/foodly
STAGING_DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require' ./database/validate-staging.sh
```

The script fails if:

- the database schema has not been created yet;
- Flyway versions `3`, `4`, or `5` are missing or failed;
- restaurant slugs are missing or duplicated;
- restaurant ownership or wishlist uniqueness would violate constraints;
- prices, totals, or quantities contain invalid values.

## 4. Smoke Test Staging

Manually test these flows on the staging frontend:

- customer signup and login;
- restaurant signup and login;
- restaurant profile loads with a non-empty slug;
- restaurant owner adds an available menu item;
- customer opens the restaurant and sees the menu item;
- customer adds to cart and places an order;
- inventory decreases only after successful order placement;
- restaurant owner updates order status;
- support chat works for the same order only;
- customer creates a review for an ordered item;
- deleting a menu item used by orders or reviews is blocked.

## 5. Production Release Rule

Only move to production when:

- `./database/validate-staging.sh` passes;
- the staging smoke test passes;
- `./mvnw -q test` passes in `backend`;
- `npm run build` passes in `frontend`;
- a production database backup has been taken.

Then deploy the same backend build to production and let Flyway apply the same migrations.
