-- Fix RLS policies for better signup support
-- This script updates policies to allow authenticated users to create their own records

-- Update users table policies
DROP POLICY IF EXISTS "Admins can insert users in their company" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Allow authenticated users to create their own user profile
CREATE POLICY "Users can create their own profile" ON users
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE TO authenticated 
    USING (auth.uid() = id);

-- Update companies table policies to be more permissive
DROP POLICY IF EXISTS "Allow authenticated users to create companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON companies;
DROP POLICY IF EXISTS "Company admins can update their company" ON companies;
DROP POLICY IF EXISTS "Users can view their company" ON companies;

-- Allow any authenticated user to create a company (for admin signup)
CREATE POLICY "Authenticated users can create companies" ON companies
    FOR INSERT TO authenticated 
    WITH CHECK (true);

-- Allow admins to update their own company
CREATE POLICY "Company admins can update their company" ON companies
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.company_id = companies.id 
            AND users.role = 'admin'
        )
    );

-- Allow users to view their own company
CREATE POLICY "Users can view their company" ON companies
    FOR SELECT TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.company_id = companies.id
        )
    );

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON companies TO authenticated;
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users(id);
CREATE INDEX IF NOT EXISTS idx_companies_id ON companies(id);

-- Verify policies
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'companies')
ORDER BY tablename, policyname; 