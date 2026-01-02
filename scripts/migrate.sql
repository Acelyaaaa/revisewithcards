
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


CREATE INDEX IF NOT EXISTS idx_user_quotas_userId ON user_quotas(userId);
CREATE INDEX IF NOT EXISTS idx_user_quotas_plan ON user_quotas(plan);
CREATE INDEX IF NOT EXISTS idx_user_quotas_stripe ON user_quotas(stripeCustomerId);


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


CREATE TABLE IF NOT EXISTS user_flashcards (
  id BIGSERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  fileName TEXT NOT NULL,
  fileUrl TEXT DEFAULT '',
  flashcards JSONB NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_flashcards_userId ON user_flashcards(userId);
CREATE INDEX IF NOT EXISTS idx_user_flashcards_createdAt ON user_flashcards(createdAt DESC);


CREATE TRIGGER update_user_flashcards_updated_at
    BEFORE UPDATE ON user_flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
        -
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
        

        ALTER TABLE user_subscriptions RENAME TO user_subscriptions_backup;
        
        RAISE NOTICE 'Migrated user_subscriptions to user_quotas';
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Database schema updated successfully!';
    RAISE NOTICE 'Tables created: user_quotas, user_flashcards';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Triggers created for auto-timestamps';
END $$;