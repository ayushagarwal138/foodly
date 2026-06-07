-- Bring existing Foodly databases created from the old schema.sql in line with
-- the OAuth-enabled user model. The baseline migration already has these fields
-- for fresh databases, but Flyway baselines non-empty production databases at V1.

ALTER TABLE users
    ALTER COLUMN password DROP NOT NULL;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'LOCAL',
    ADD COLUMN IF NOT EXISTS provider_subject VARCHAR(255),
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE users
SET provider = 'LOCAL'
WHERE provider IS NULL;

UPDATE users
SET email_verified = FALSE
WHERE email_verified IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_users_provider_subject'
          AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT uq_users_provider_subject UNIQUE (provider, provider_subject);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_provider_subject ON users(provider, provider_subject);
