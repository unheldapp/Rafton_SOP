// Copy and paste this into your browser console on the reports page

console.log('=== TESTING REPORTS DATA ===');

// Your company ID from the logs
const companyId = '45f9aae9-0b36-4c36-a52c-1868c2db2b83';

// Test 1: Check basic sop_assignments
console.log('1. Testing basic sop_assignments...');
supabase.from('sop_assignments').select('*').then(result => {
  console.log('All assignments count:', result.data?.length || 0);
  console.log('All assignments data:', result.data);
  if (result.error) console.error('Error:', result.error);
});

// Test 2: Check SOPs for your company
console.log('2. Testing SOPs for your company...');
supabase.from('sops').select('*').eq('company_id', companyId).is('deleted_at', null).then(result => {
  console.log('Your company SOPs count:', result.data?.length || 0);
  console.log('Your company SOPs:', result.data);
  if (result.error) console.error('Error:', result.error);
});

// Test 3: Check users for your company
console.log('3. Testing users for your company...');
supabase.from('users').select('*').eq('company_id', companyId).is('deleted_at', null).then(result => {
  console.log('Your company users count:', result.data?.length || 0);
  console.log('Your company users:', result.data);
  if (result.error) console.error('Error:', result.error);
});

// Test 4: Check assignments with SOPs joined (the actual report query)
console.log('4. Testing acknowledgment report query...');
supabase.from('sop_assignments')
.select(`
  id,
  due_date,
  priority,
  status,
  notes,
  created_at,
  sop_id,
  user_id,
  assigned_by,
  sops!inner (
    id,
    title,
    version,
    department,
    company_id
  ),
  user:users!user_id (
    id,
    first_name,
    last_name,
    email,
    department
  )
`)
.eq('sops.company_id', companyId)
.then(result => {
  console.log('Acknowledgment report data count:', result.data?.length || 0);
  console.log('Acknowledgment report data:', result.data);
  if (result.error) console.error('Acknowledgment report error:', result.error);
});

// Test 5: Check assignments without company filtering
console.log('5. Testing assignments joined with SOPs (no company filter)...');
supabase.from('sop_assignments')
.select(`
  id,
  status,
  sops!inner (
    id,
    title,
    company_id
  ),
  user:users!user_id (
    first_name,
    last_name
  )
`)
.then(result => {
  console.log('All assignments with SOPs count:', result.data?.length || 0);
  console.log('All assignments with SOPs:', result.data);
  if (result.error) console.error('Error:', result.error);
});

// Test 6: Check what's in acknowledgments table
console.log('6. Testing acknowledgments table...');
supabase.from('acknowledgments').select('*').then(result => {
  console.log('Acknowledgments count:', result.data?.length || 0);
  console.log('Acknowledgments data:', result.data);
  if (result.error) console.error('Error:', result.error);
});

console.log('=== TESTS STARTED - Check results above ==='); 