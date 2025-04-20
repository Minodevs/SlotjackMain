-- SQL Script to make a user an admin
-- Run this in Supabase SQL Editor

-- Replace 'sezarpaypals2@gmail.com' with the email if different
UPDATE profiles
SET rank = 'admin' 
WHERE email = 'sezarpaypals2@gmail.com';

-- Verify the change
SELECT * FROM profiles
WHERE email = 'sezarpaypals2@gmail.com'; 