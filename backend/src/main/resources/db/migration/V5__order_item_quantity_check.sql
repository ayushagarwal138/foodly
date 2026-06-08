DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'order_items'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) ~* 'quantity\)?> 0|quantity > 0'
    ) THEN
        ALTER TABLE order_items
            ADD CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0);
    END IF;
END $$;
