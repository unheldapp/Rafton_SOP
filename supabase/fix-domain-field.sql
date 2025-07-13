-- Fix domain field to be nullable and non-unique
-- Many users will use Gmail and other shared domains

-- First, let's see the current constraints on the domain field
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'companies'::regclass 
AND conname LIKE '%domain%';

-- Drop unique constraint on domain if it exists (constraint first, then index)
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_domain_key;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS unique_companies_domain;
DROP INDEX IF EXISTS companies_domain_key;
DROP INDEX IF EXISTS idx_companies_domain_unique;

-- Make domain field nullable
ALTER TABLE companies ALTER COLUMN domain DROP NOT NULL;

-- Add a partial index for performance (only on non-null domains)
CREATE INDEX IF NOT EXISTS idx_companies_domain_partial 
ON companies(domain) 
WHERE domain IS NOT NULL;

-- Update existing records with empty domains to NULL
UPDATE companies 
SET domain = NULL 
WHERE domain = '' OR domain IS NULL;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name = 'domain';

-- Show remaining constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'companies'::regclass; 