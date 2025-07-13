-- Fix RLS policies for company creation during signup
-- This script addresses the issue where new users can't create companies due to restrictive RLS policies

-- Temporarily disable RLS for companies table during development/testing
-- (Uncomment if you want to completely disable RLS for testing)
-- ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Or, update the RLS policies to allow company creation during signup

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Companies are viewable by company members" ON companies;
DROP POLICY IF EXISTS "Companies can only be managed by admins" ON companies;

-- Create more permissive policies that allow initial company creation

-- Allow authenticated users to create companies (for initial signup)
CREATE POLICY "Allow authenticated users to create companies" ON companies
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow users to view companies they belong to
CREATE POLICY "Users can view their company" ON companies
  FOR SELECT 
  TO authenticated 
  USING (
    id IN (
      SELECT company_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Allow company admins to update their company
CREATE POLICY "Company admins can update their company" ON companies
  FOR UPDATE 
  TO authenticated 
  USING (
    id IN (
      SELECT company_id 
      FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Allow company admins to delete their company (optional, usually not needed)
CREATE POLICY "Company admins can delete their company" ON companies
  FOR DELETE 
  TO authenticated 
  USING (
    id IN (
      SELECT company_id 
      FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Also fix users table policies to allow user creation during signup

-- Drop existing restrictive user policies
DROP POLICY IF EXISTS "Users can view their own profile and company members" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow authenticated users to create their own user record
CREATE POLICY "Users can create their own record" ON users
  FOR INSERT 
  TO authenticated 
  WITH CHECK (id = auth.uid());

-- Allow users to view their own profile and users in their company
CREATE POLICY "Users can view company members" ON users
  FOR SELECT 
  TO authenticated 
  USING (
    id = auth.uid() OR 
    company_id IN (
      SELECT company_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid());

-- Ensure RLS is enabled on both tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- For debugging: Check if policies are working
-- You can run these queries to test:
-- SELECT * FROM companies; -- Should work after creating a company
-- SELECT * FROM users; -- Should work after user creation

COMMENT ON TABLE companies IS 'Updated RLS policies to allow company creation during signup';
COMMENT ON TABLE users IS 'Updated RLS policies to allow user record creation during signup'; 