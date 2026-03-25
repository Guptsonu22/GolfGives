// =============================================
// SUPABASE DATABASE SCHEMA
// Run this SQL in Supabase SQL Editor
// =============================================



-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CHARITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS charities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website TEXT,
  category TEXT DEFAULT 'General',
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_raised DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
  plan_type TEXT DEFAULT 'monthly' CHECK (plan_type IN ('monthly', 'yearly')),
  charity_id UUID REFERENCES charities(id),
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SCORES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);

-- =============================================
-- DRAWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS draws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_name TEXT NOT NULL,
  draw_numbers INTEGER[] NOT NULL,
  draw_date DATE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'simulated', 'published')),
  total_pool DECIMAL(10,2) DEFAULT 0,
  jackpot_pool DECIMAL(10,2) DEFAULT 0,
  four_match_pool DECIMAL(10,2) DEFAULT 0,
  three_match_pool DECIMAL(10,2) DEFAULT 0,
  jackpot_rollover BOOLEAN DEFAULT FALSE,
  rollover_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WINNINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS winnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  matched_numbers INTEGER[],
  amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'paid', 'rejected')),
  proof_url TEXT,
  admin_notes TEXT,
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DRAW ENTRIES TABLE (tracks who participated)
-- =============================================
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  entry_numbers INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- =============================================
-- CHARITY CONTRIBUTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS charity_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  charity_id UUID REFERENCES charities(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  contribution_month DATE NOT NULL,
  subscription_amount DECIMAL(10,2),
  percentage INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SEED DEFAULT CHARITIES
-- =============================================
INSERT INTO charities (name, description, category, is_featured, is_active) VALUES
  ('Cancer Research UK', 'Funding world-class cancer research to save lives across the UK and beyond.', 'Health', TRUE, TRUE),
  ('British Heart Foundation', 'Fighting heart and circulatory diseases through research, prevention, and care.', 'Health', TRUE, TRUE),
  ('Macmillan Cancer Support', 'Providing vital support to people living with cancer and their families.', 'Health', FALSE, TRUE),
  ('Age UK', 'Improving later life for everyone through compassionate community support.', 'Elderly Care', FALSE, TRUE),
  ('Save the Children UK', 'Giving children a healthy start, the opportunity to learn and protection from harm.', 'Children', TRUE, TRUE),
  ('Shelter', 'Defending the right to a safe home and fighting the devastation of homelessness.', 'Housing', FALSE, TRUE),
  ('Mind', 'Providing advice and support to empower anyone experiencing a mental health problem.', 'Mental Health', FALSE, TRUE),
  ('WWF UK', 'Protecting nature and addressing the most pressing environmental challenges.', 'Environment', FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own profile
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Scores policies
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all scores" ON scores FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Draws - public read, admin write
CREATE POLICY "Anyone can read published draws" ON draws FOR SELECT USING (status = 'published' OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Winnings - users see own, admins see all
CREATE POLICY "Users can read own winnings" ON winnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own winnings proof" ON winnings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all winnings" ON winnings FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Draw entries
CREATE POLICY "Users can read own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all entries" ON draw_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Charities - public read
CREATE POLICY "Anyone can read charities" ON charities FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Charity contributions
CREATE POLICY "Users can read own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all contributions" ON charity_contributions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- =============================================
-- FUNCTION: Handle user creation
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


