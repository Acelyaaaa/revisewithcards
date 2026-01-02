-- Production-Ready Database Schema for RevieCards
-- Run this in your Neon console to create/update all tables

-- =====================================================
-- USER QUOTAS & SUBSCRIPTIONS (UNIFIED)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_quotas (
  id BIGSERIAL PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  uploadsThisMonth INTEGER DEFAULT 0,
  lastReset TIMESTAMPTZ DEFAULT NOW(),
  plan TEXT NOT NULL DEFAULT 'free',
  stripeCustomerId TEXT,
  stripeSubscriptionId TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_quotas_userId ON user_quotas(userId);
CREATE INDEX IF NOT EXISTS idx_user_quotas_plan ON user_quotas(plan);
CREATE INDEX IF NOT EXISTS idx_user_quotas_stripe ON user_quotas(stripeCustomerId);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_quotas_updated_at
    BEFORE UPDATE ON user_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- USER FLASHCARDS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_flashcards (
  id BIGSERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  fileName TEXT NOT NULL,
  fileUrl TEXT DEFAULT '',
  flashcards JSONB NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_flashcards_userId ON user_flashcards(userId);
CREATE INDEX IF NOT EXISTS idx_user_flashcards_createdAt ON user_flashcards(createdAt DESC);

-- Auto-update timestamp trigger
CREATE TRIGGER update_user_flashcards_updated_at
    BEFORE UPDATE ON user_flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION: Merge old user_subscriptions into user_quotas
-- =====================================================
-- If you have old user_subscriptions table, migrate data
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
        -- Merge data from user_subscriptions into user_quotas
        INSERT INTO user_quotas (userId, plan, stripeCustomerId, stripeSubscriptionId, createdAt, updatedAt)
        SELECT 
            user_id,
            CASE 
                WHEN status = 'active' THEN 'premium'
                ELSE 'free'
            END,
            stripe_customer_id,
            stripe_subscription_id,
            created_at,
            updated_at
        FROM user_subscriptions
        ON CONFLICT (userId) DO UPDATE SET
            plan = EXCLUDED.plan,
            stripeCustomerId = EXCLUDED.stripeCustomerId,
            stripeSubscriptionId = EXCLUDED.stripeSubscriptionId;
        
        -- Archive old table (don't delete in case you need to rollback)
        ALTER TABLE user_subscriptions RENAME TO user_subscriptions_backup;
        
        RAISE NOTICE 'Migrated user_subscriptions to user_quotas';
    END IF;
END $$;

-- =====================================================
-- VERIFY TABLES
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Database schema updated successfully!';
    RAISE NOTICE 'Tables created: user_quotas, user_flashcards';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Triggers created for auto-timestamps';
END $$;