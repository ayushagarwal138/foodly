-- Preflight checks for V3__database_integrity_hardening.sql.
-- Run this against staging before deploying the backend that includes V3.
-- Every issue_count should be 0 before Flyway applies V3.

\echo 'Foodly V3 database integrity preflight'
\echo 'Expected result: every issue_count is 0'

SELECT 'duplicate_restaurant_owner' AS check_name, COUNT(*) AS issue_count
FROM (
    SELECT owner_id
    FROM restaurants
    GROUP BY owner_id
    HAVING COUNT(*) > 1
) issues;

SELECT 'duplicate_restaurant_wishlist' AS check_name, COUNT(*) AS issue_count
FROM (
    SELECT customer_id, restaurant_id
    FROM wishlist
    WHERE type = 'RESTAURANT'
      AND restaurant_id IS NOT NULL
    GROUP BY customer_id, restaurant_id
    HAVING COUNT(*) > 1
) issues;

SELECT 'duplicate_dish_wishlist' AS check_name, COUNT(*) AS issue_count
FROM (
    SELECT customer_id, restaurant_id, menu_item_id
    FROM wishlist
    WHERE type = 'DISH'
      AND restaurant_id IS NOT NULL
      AND menu_item_id IS NOT NULL
    GROUP BY customer_id, restaurant_id, menu_item_id
    HAVING COUNT(*) > 1
) issues;

SELECT 'negative_menu_item_price' AS check_name, COUNT(*) AS issue_count
FROM menu_items
WHERE price < 0;

SELECT 'negative_menu_item_quantity' AS check_name, COUNT(*) AS issue_count
FROM menu_items
WHERE quantity_available < 0;

SELECT 'negative_order_total' AS check_name, COUNT(*) AS issue_count
FROM orders
WHERE total < 0;

SELECT 'negative_order_item_price' AS check_name, COUNT(*) AS issue_count
FROM order_items
WHERE price < 0;

SELECT 'invalid_order_item_quantity' AS check_name, COUNT(*) AS issue_count
FROM order_items
WHERE quantity <= 0;

\echo ''
\echo 'Details for any non-zero checks'

SELECT 'duplicate_restaurant_owner' AS check_name, owner_id, COUNT(*) AS duplicate_count
FROM restaurants
GROUP BY owner_id
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
