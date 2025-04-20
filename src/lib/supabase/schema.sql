-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'bonus', 'event', 'admin')),
  user_phone TEXT,
  user_social_media JSONB,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Row-level security policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Only admin users can see all transactions
CREATE POLICY admin_all_access ON transactions
  USING (auth.jwt() ->> 'role' = 'admin');

-- Users can only see their own transactions
CREATE POLICY user_read_own ON transactions FOR SELECT
  USING (user_id = auth.uid());

-- Function to sync transactions with user points
CREATE OR REPLACE FUNCTION sync_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's points in the profiles table
  -- This assumes you have a profiles table with points field
  UPDATE profiles
  SET points = (
    SELECT COALESCE(SUM(CASE 
      WHEN type = 'spend' THEN -amount 
      ELSE amount 
    END), 0)
    FROM transactions
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update points when transactions change
DROP TRIGGER IF EXISTS update_user_points ON transactions;
CREATE TRIGGER update_user_points
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION sync_user_points(); 