-- Run this to fix the RLS policy for inserting scores

DROP POLICY IF EXISTS "Users can manage own scores" ON scores;
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own scores" ON scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON scores FOR DELETE USING (auth.uid() = user_id);

-- Fix Winnings just in case
DROP POLICY IF EXISTS "Users can read own winnings" ON winnings;
DROP POLICY IF EXISTS "Users can update own winnings proof" ON winnings;
CREATE POLICY "Users can read own winnings" ON winnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own winnings proof" ON winnings FOR UPDATE USING (auth.uid() = user_id);

-- Fix Draw Entries
DROP POLICY IF EXISTS "Users can read own entries" ON draw_entries;
CREATE POLICY "Users can read own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON draw_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure authenticated users can insert (Supabase sometimes requires this grant)
GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
