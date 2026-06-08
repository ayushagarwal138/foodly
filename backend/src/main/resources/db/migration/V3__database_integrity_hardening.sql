ALTER TABLE menu_items
    ADD CONSTRAINT chk_menu_items_price_nonnegative CHECK (price >= 0);

ALTER TABLE menu_items
    ADD CONSTRAINT chk_menu_items_quantity_nonnegative CHECK (quantity_available IS NULL OR quantity_available >= 0);

ALTER TABLE orders
    ADD CONSTRAINT chk_orders_total_nonnegative CHECK (total >= 0);

ALTER TABLE order_items
    ADD CONSTRAINT chk_order_items_price_nonnegative CHECK (price >= 0);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uq_restaurants_owner_id'
          AND conrelid = 'restaurants'::regclass
    ) THEN
        ALTER TABLE restaurants
            ADD CONSTRAINT uq_restaurants_owner_id UNIQUE (owner_id);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wishlist_customer_restaurant
    ON wishlist (customer_id, restaurant_id)
    WHERE type = 'RESTAURANT' AND restaurant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_wishlist_customer_dish
    ON wishlist (customer_id, restaurant_id, menu_item_id)
    WHERE type = 'DISH' AND restaurant_id IS NOT NULL AND menu_item_id IS NOT NULL;

DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'order_items'::regclass
      AND confrelid = 'menu_items'::regclass
      AND conkey = ARRAY[
          (SELECT attnum FROM pg_attribute WHERE attrelid = 'order_items'::regclass AND attname = 'menu_item_id')
      ]::smallint[];

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE order_items DROP CONSTRAINT %I', constraint_name);
    END IF;

    ALTER TABLE order_items
        ADD CONSTRAINT fk_order_items_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT;
END $$;

DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'reviews'::regclass
      AND confrelid = 'menu_items'::regclass
      AND conkey = ARRAY[
          (SELECT attnum FROM pg_attribute WHERE attrelid = 'reviews'::regclass AND attname = 'menu_item_id')
      ]::smallint[];

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE reviews DROP CONSTRAINT %I', constraint_name);
    END IF;

    ALTER TABLE reviews
        ADD CONSTRAINT fk_reviews_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT;
END $$;
