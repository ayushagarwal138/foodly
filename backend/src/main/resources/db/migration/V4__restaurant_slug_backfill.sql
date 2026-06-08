UPDATE restaurants
SET slug = lower(regexp_replace(coalesce(nullif(trim(name), ''), 'restaurant-' || id), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL OR trim(slug) = '';

UPDATE restaurants
SET slug = trim(both '-' from slug)
WHERE slug IS NOT NULL;

UPDATE restaurants
SET slug = 'restaurant-' || id
WHERE slug IS NULL OR trim(slug) = '';

WITH duplicate_slugs AS (
    SELECT id, row_number() OVER (PARTITION BY slug ORDER BY id) AS slug_rank
    FROM restaurants
)
UPDATE restaurants r
SET slug = r.slug || '-' || r.id
FROM duplicate_slugs d
WHERE r.id = d.id
  AND d.slug_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_restaurants_slug
    ON restaurants (slug)
    WHERE slug IS NOT NULL;
