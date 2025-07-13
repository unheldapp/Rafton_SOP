-- Debug queries to check why reports are not showing data

-- 1. Check if we have SOPs for your company
SELECT 
  COUNT(*) as sop_count,
  company_id
FROM sops 
WHERE deleted_at IS NULL 
GROUP BY company_id;

-- 2. Check if we have users for your company  
SELECT 
  COUNT(*) as user_count,
  company_id
FROM users 
WHERE deleted_at IS NULL 
GROUP BY company_id;

-- 3. Check if we have any SOP assignments at all
SELECT 
  COUNT(*) as assignment_count
FROM sop_assignments;

-- 4. Check SOP assignments with SOPs joined (for acknowledgment report)
SELECT 
  sa.id,
  sa.status,
  sa.created_at,
  s.title as sop_title,
  s.company_id,
  u.first_name,
  u.last_name
FROM sop_assignments sa
JOIN sops s ON sa.sop_id = s.id
JOIN users u ON sa.user_id = u.id
WHERE s.deleted_at IS NULL
LIMIT 10;

-- 5. Check your specific company data
-- Replace 'YOUR_COMPANY_ID' with your actual company ID
SELECT 
  'SOPs' as table_name,
  COUNT(*) as count
FROM sops 
WHERE company_id = 'YOUR_COMPANY_ID' AND deleted_at IS NULL

UNION ALL

SELECT 
  'Users' as table_name,
  COUNT(*) as count
FROM users 
WHERE company_id = 'YOUR_COMPANY_ID' AND deleted_at IS NULL

UNION ALL

SELECT 
  'Assignments' as table_name,
  COUNT(*) as count
FROM sop_assignments sa
JOIN sops s ON sa.sop_id = s.id
WHERE s.company_id = 'YOUR_COMPANY_ID' AND s.deleted_at IS NULL;

-- 6. Check if assignments exist for any company
SELECT 
  s.company_id,
  COUNT(sa.id) as assignment_count
FROM sop_assignments sa
JOIN sops s ON sa.sop_id = s.id
WHERE s.deleted_at IS NULL
GROUP BY s.company_id; 