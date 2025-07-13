-- Add company_id to sop_assignments table for better audit logging and performance
-- This makes the table structure consistent with other tables

-- Add the company_id column
ALTER TABLE sop_assignments 
ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Update existing records to set company_id from the related SOP
UPDATE sop_assignments 
SET company_id = sops.company_id 
FROM sops 
WHERE sop_assignments.sop_id = sops.id;

-- Make company_id NOT NULL after updating existing records
ALTER TABLE sop_assignments 
ALTER COLUMN company_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_sop_assignments_company_id ON sop_assignments(company_id);

-- Add RLS policy for the company_id field
DROP POLICY IF EXISTS "Users can view assignments in their company" ON sop_assignments;
DROP POLICY IF EXISTS "Admins can manage assignments in their company" ON sop_assignments;

-- Create new RLS policies using the company_id field directly
CREATE POLICY "Users can view assignments in their company" ON sop_assignments
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage assignments in their company" ON sop_assignments
  FOR ALL USING (company_id = get_user_company_id() AND is_user_admin()); 