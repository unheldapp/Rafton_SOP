-- Script to create test users for Rafton SOP Management Platform
-- Run this in Supabase SQL Editor

-- Company ID from the current setup
-- Replace with your actual company ID if different: 45f9aae9-0b36-4c36-a52c-1868c2db2b83

-- 1. Create Employee User
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_sent_at,
  email_change,
  email_change_token_new,
  email_change_token_current,
  created_at,
  updated_at,
  phone_confirmed_at,
  phone_change_sent_at,
  phone_change_token,
  phone_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'employee@rafton.com',
  crypt('Employee123!', gen_salt('bf')),
  now(),
  now(),
  '',
  null,
  '',
  null,
  '',
  '',
  '',
  now(),
  now(),
  null,
  null,
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"John","last_name":"Employee"}',
  false,
  now()
);

-- 2. Create Auditor User  
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_sent_at,
  email_change,
  email_change_token_new,
  email_change_token_current,
  created_at,
  updated_at,
  phone_confirmed_at,
  phone_change_sent_at,
  phone_change_token,
  phone_change,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'auditor@rafton.com',
  crypt('Auditor123!', gen_salt('bf')),
  now(),
  now(),
  '',
  null,
  '',
  null,
  '',
  '',
  '',
  now(),
  now(),
  null,
  null,
  '',
  '',
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Sarah","last_name":"Auditor"}',
  false,
  now()
);

-- 3. Add Employee to users table
INSERT INTO public.users (
  id,
  company_id,
  email,
  first_name,
  last_name,
  role,
  status,
  department,
  position,
  email_verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'employee@rafton.com'),
  '45f9aae9-0b36-4c36-a52c-1868c2db2b83',
  'employee@rafton.com',
  'John',
  'Employee',
  'employee',
  'active',
  'Operations',
  'Operations Specialist',
  true,
  now(),
  now()
);

-- 4. Add Auditor to users table
INSERT INTO public.users (
  id,
  company_id,
  email,
  first_name,
  last_name,
  role,
  status,
  department,
  position,
  email_verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'auditor@rafton.com'),
  '45f9aae9-0b36-4c36-a52c-1868c2db2b83',
  'auditor@rafton.com',
  'Sarah',
  'Auditor',
  'auditor',
  'active',
  'Quality Assurance',
  'Senior Auditor',
  true,
  now(),
  now()
);

-- 5. Verify the users were created
SELECT 
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  u.status,
  u.department,
  u.position,
  c.name as company_name
FROM public.users u
JOIN public.companies c ON u.company_id = c.id
WHERE u.email IN ('employee@rafton.com', 'auditor@rafton.com')
ORDER BY u.role; 