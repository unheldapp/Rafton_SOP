-- Test script for acknowledgment functionality
-- This script creates sample data to test the acknowledgment system

-- Create a test SOP assignment
INSERT INTO sop_assignments (
  id,
  sop_id,
  user_id,
  assigned_by,
  due_date,
  priority,
  status,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM sops WHERE title LIKE '%Safety%' LIMIT 1),
  '6e30c6cc-cf4e-419b-b843-d7457415e150', -- shreyash@rafton.com
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  NOW() + INTERVAL '7 days',
  'high',
  'pending',
  'Please review and acknowledge this important safety procedure.',
  NOW(),
  NOW()
);

-- Create another assignment that's overdue
INSERT INTO sop_assignments (
  id,
  sop_id,
  user_id,
  assigned_by,
  due_date,
  priority,
  status,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM sops WHERE title LIKE '%Quality%' LIMIT 1),
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  NOW() - INTERVAL '2 days',
  'critical',
  'pending',
  'This assignment is now overdue.',
  NOW() - INTERVAL '10 days',
  NOW()
);

-- Create an assignment that has been declined
INSERT INTO sop_assignments (
  id,
  sop_id,
  user_id,
  assigned_by,
  due_date,
  priority,
  status,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM sops WHERE title LIKE '%Training%' LIMIT 1),
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  NOW() + INTERVAL '5 days',
  'medium',
  'pending',
  'DECLINED: Need more information about the training requirements.',
  NOW() - INTERVAL '3 days',
  NOW()
);

-- Create an acknowledged assignment
INSERT INTO sop_assignments (
  id,
  sop_id,
  user_id,
  assigned_by,
  due_date,
  priority,
  status,
  notes,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM sops WHERE title LIKE '%Security%' LIMIT 1),
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  NOW() + INTERVAL '3 days',
  'low',
  'acknowledged',
  'Acknowledged and understood.',
  NOW() - INTERVAL '5 days',
  NOW()
);

-- Create corresponding acknowledgment for the acknowledged assignment
INSERT INTO acknowledgments (
  id,
  assignment_id,
  user_id,
  sop_id,
  sop_version,
  notes,
  acknowledged_at,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM sop_assignments WHERE status = 'acknowledged' LIMIT 1),
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  (SELECT sop_id FROM sop_assignments WHERE status = 'acknowledged' LIMIT 1),
  '1.0',
  'I have read and understood this security procedure.',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- Create some reminders for pending assignments
INSERT INTO reminders (
  id,
  assignment_id,
  user_id,
  type,
  message,
  channel,
  scheduled_at,
  sent_at,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM sop_assignments WHERE status = 'pending' LIMIT 1),
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  'acknowledgment',
  'Reminder: Please acknowledge your assigned SOP.',
  'email',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  'sent',
  NOW() - INTERVAL '1 day'
);

-- Create a notification
INSERT INTO notifications (
  id,
  user_id,
  type,
  title,
  message,
  data,
  read,
  priority,
  created_at
) VALUES (
  gen_random_uuid(),
  '6e30c6cc-cf4e-419b-b843-d7457415e150',
  'acknowledgment_reminder',
  'SOP Acknowledgment Reminder',
  'You have pending SOP acknowledgments that require your attention.',
  '{"assignmentCount": 2}',
  false,
  'medium',
  NOW()
);

-- Query to verify the test data
SELECT 
  sa.id,
  s.title as sop_title,
  u.first_name || ' ' || u.last_name as assigned_to,
  sa.status,
  sa.priority,
  sa.due_date,
  sa.notes,
  CASE 
    WHEN a.id IS NOT NULL THEN 'acknowledged'
    WHEN sa.notes LIKE 'DECLINED:%' THEN 'declined'
    WHEN sa.due_date < NOW() AND sa.status != 'acknowledged' THEN 'overdue'
    ELSE 'pending'
  END as computed_status,
  a.acknowledged_at,
  (SELECT COUNT(*) FROM reminders WHERE assignment_id = sa.id) as reminder_count
FROM sop_assignments sa
JOIN sops s ON sa.sop_id = s.id
JOIN users u ON sa.user_id = u.id
LEFT JOIN acknowledgments a ON sa.id = a.assignment_id
WHERE sa.user_id = '6e30c6cc-cf4e-419b-b843-d7457415e150'
ORDER BY sa.created_at DESC; 