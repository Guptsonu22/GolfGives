-- Run this in Supabase SQL Editor to instantly fix any users who signed up before the schema was ready

INSERT INTO public.users (id, email, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.users);
