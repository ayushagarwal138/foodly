-- Current release staging validation.
-- Run after the backend has started against staging and Flyway has applied migrations.
-- The script raises an error if any check has a non-zero issue_count.

\echo 'Foodly current-release database validation'
\echo 'Expected result: every issue_count is 0'

CREATE TEMP TABLE foodly_release_checks (
    check_name text PRIMARY KEY,
    issue_count bigint NOT NULL
) ON COMMIT DROP;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'flyway_v3_applied', CASE WHEN EXISTS (
    SELECT 1 FROM flyway_schema_history
    WHERE version = '3' AND success = true
) THEN 0 ELSE 1 END;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'flyway_v4_applied', CASE WHEN EXISTS (
    SELECT 1 FROM flyway_schema_history
    WHERE version = '4' AND success = true
) THEN 0 ELSE 1 END;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'flyway_v5_applied', CASE WHEN EXISTS (
    SELECT 1 FROM flyway_schema_history
    WHERE version = '5' AND success = true
) THEN 0 ELSE 1 END;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'duplicate_restaurant_owner', COUNT(*)
FROM (
    SELECT owner_id
    FROM restaurants
    WHERE owner_id IS NOT NULL
    GROUP BY owner_id
    HAVING COUNT(*) > 1
) issues;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'missing_restaurant_slug', COUNT(*)
FROM restaurants
WHERE slug IS NULL OR trim(slug) = '';

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'duplicate_restaurant_slug', COUNT(*)
FROM (
    SELECT slug
    FROM restaurants
    WHERE slug IS NOT NULL AND trim(slug) <> ''
    GROUP BY slug
    HAVING COUNT(*) > 1
) issues;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'duplicate_restaurant_wishlist', COUNT(*)
FROM (
    SELECT customer_id, restaurant_id
    FROM wishlist
    WHERE type = 'RESTAURANT'
      AND restaurant_id IS NOT NULL
    GROUP BY customer_id, restaurant_id
    HAVING COUNT(*) > 1
) issues;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'duplicate_dish_wishlist', COUNT(*)
FROM (
    SELECT customer_id, restaurant_id, menu_item_id
    FROM wishlist
    WHERE type = 'DISH'
      AND restaurant_id IS NOT NULL
      AND menu_item_id IS NOT NULL
    GROUP BY customer_id, restaurant_id, menu_item_id
    HAVING COUNT(*) > 1
) issues;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'negative_menu_item_price', COUNT(*)
FROM menu_items
WHERE price < 0;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'negative_menu_item_quantity', COUNT(*)
FROM menu_items
WHERE quantity_available < 0;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'negative_order_total', COUNT(*)
FROM orders
WHERE total < 0;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'negative_order_item_price', COUNT(*)
FROM order_items
WHERE price < 0;

INSERT INTO foodly_release_checks (check_name, issue_count)
SELECT 'invalid_order_item_quantity', COUNT(*)
FROM order_items
WHERE quantity <= 0;

TABLE foodly_release_checks ORDER BY check_name;

\echo ''
\echo 'Flyway migration history'
SELECT version, description, success, installed_on
FROM flyway_schema_history
ORDER BY installed_rank;

\echo ''
\echo 'Details for any non-zero data checks'

SELECT 'duplicate_restaurant_owner' AS check_name, owner_id, COUNT(*) AS duplicate_count
FROM restaurants
WHERE owner_id IS NOT NULL
GROUP BY owner_id
HAVING COUNT(*) > 1;

SELECT 'missing_restaurant_slug' AS check_name, id, name
FROM restaurants
WHERE slug IS NULL OR trim(slug) = '';

SELECT 'duplicate_restaurant_slug' AS check_name, slug, COUNT(*) AS duplicate_count
FROM restaurants
WHERE slug IS NOT NULL AND trim(slug) <> ''
GROUP BY slug
HAVING COUNT(*) > 1;

SELECT 'duplicate_restaurant_wishlist' AS check_name, customer_id, restaurant_id, COUNT(*) AS duplicate_count
FROM wishlist
WHERE type = 'RESTAURANT'
  AND restaurant_id IS NOT NULL
GROUP BY customer_id, restaurant_id
HAVING COUNT(*) > 1;

SELECT 'duplicate_dish_wishlist' AS check_name, customer_id, restaurant_id, menu_item_id, COUNT(*) AS duplicate_count
FROM wishlist
WHERE type = 'DISH'
  AND restaurant_id IS NOT NULL
  AND menu_item_id IS NOT NULL
GROUP BY customer_id, restaurant_id, menu_item_id
HAVING COUNT(*) > 1;

SELECT 'negative_menu_item_price' AS check_name, id, name, price
FROM menu_items
WHERE price < 0;

SELECT 'negative_menu_item_quantity' AS check_name, id, name, quantity_available
FROM menu_items
WHERE quantity_available < 0;

SELECT 'negative_order_total' AS check_name, id, total
FROM orders
WHERE total < 0;

SELECT 'negative_order_item_price' AS check_name, id, order_id, menu_item_id, price
FROM order_items
WHERE price < 0;

SELECT 'invalid_order_item_quantity' AS check_name, id, order_id, menu_item_id, quantity
FROM order_items
WHERE quantity <= 0;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM foodly_release_checks WHERE issue_count <> 0) THEN
        RAISE EXCEPTION 'Foodly staging validation failed. Fix non-zero issue_count rows before production.';
    END IF;
END $$;
