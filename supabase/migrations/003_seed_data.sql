-- ============================================================
-- 003_seed_data.sql
-- Step 1: Create the gym record
-- Step 2: Sign up via Supabase Auth, then run Step 3
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- STEP 1: Create gym
INSERT INTO gyms (name, slug, phone, email, address, timezone, currency)
VALUES (
  'Gymnazo',
  'gymnazo',
  '+919876543210',        -- ← Replace with actual phone
  'owner@gymnazo.com',   -- ← Replace with owner email
  '123 Fitness Street, Mumbai, Maharashtra - 400001',
  'Asia/Kolkata',
  'INR'
);

-- STEP 2: Go to Supabase Dashboard → Authentication → Users → Add User
-- Create user with:
--   Email: owner@gymnazo.com (or your actual email)
--   Password: choose a strong password
--   Auto Confirm: enabled

-- STEP 3: After creating the auth user, run this to link staff record:
-- (The user_id comes from Auth → Users table)
/*
INSERT INTO staff_users (gym_id, user_id, name, email, role)
SELECT
  g.id,
  au.id,
  'Gym Owner',
  'owner@gymnazo.com',
  'owner'
FROM gyms g
JOIN auth.users au ON au.email = 'owner@gymnazo.com'
WHERE g.slug = 'gymnazo';
*/

-- STEP 4: Seed starter membership plans
INSERT INTO membership_plans (gym_id, name, category, duration_days, price, description, perks)
SELECT
  g.id,
  plan.name,
  plan.category,
  plan.duration_days::int,
  plan.price::numeric,
  plan.description,
  plan.perks
FROM gyms g,
(VALUES
  ('Monthly Basic',   'Regular', '30',  '1200', 'Standard 1-month membership',        ARRAY['Full gym access', 'Locker room']),
  ('Monthly Premium', 'Premium', '30',  '1800', 'Premium with extra services',         ARRAY['Full gym access', 'Locker room', 'Towel service', 'Diet consultation']),
  ('Quarterly',       'Regular', '90',  '3000', '3-month membership with savings',     ARRAY['Full gym access', 'Locker room', 'Free fitness assessment']),
  ('Half Yearly',     'Regular', '180', '5500', '6-month membership — great value',   ARRAY['Full gym access', 'Locker room', 'Free fitness assessment', 'Priority access']),
  ('Annual',          'Regular', '365', '9000', '12-month membership — best value',   ARRAY['Full gym access', 'Locker room', 'Free fitness assessment', 'Priority access', '2 free PT sessions']),
  ('Student Monthly', 'Student', '30',   '800', 'Discounted plan for students',        ARRAY['Full gym access', 'Locker room'])
) AS plan(name, category, duration_days, price, description, perks)
WHERE g.slug = 'gymnazo';
