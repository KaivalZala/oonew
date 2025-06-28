/*
  # Create Admin User

  1. Authentication Setup
    - Creates an admin user with email: admin@oona.com
    - Sets password to: password123
    - This matches the demo credentials shown in the login page

  2. Security
    - User will be created in Supabase Auth
    - No additional database tables needed as Supabase handles auth internally
*/

-- Insert admin user into auth.users
-- Note: This is a one-time setup for demo purposes
-- In production, you would create users through the Supabase dashboard or auth API

-- The user creation will be handled by Supabase Auth system
-- This migration serves as documentation for the required admin credentials
-- 
-- To create the admin user, you need to:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user"
-- 4. Enter email: admin@oona.com
-- 5. Enter password: password123
-- 6. Confirm the user creation
--
-- Alternatively, you can use the Supabase Auth API or create the user programmatically