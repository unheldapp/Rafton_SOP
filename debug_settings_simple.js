// Simple Settings Debug Script
// Copy and paste this into your browser console when on the settings page

console.log('🔍 Debug Settings Integration - Step by Step');

// Step 1: Check if modules are available
console.log('\n1. Checking module availability...');
try {
  // Check if we can access the auth context
  if (window.React) {
    console.log('✅ React is available');
  } else {
    console.log('❌ React not found');
  }
  
  // Try to get the current user from Supabase directly
  console.log('\n2. Testing Supabase direct access...');
  
  // This should work if Supabase is properly configured
  fetch('/shared/services/supabase.js')
    .then(() => console.log('✅ Supabase service file accessible'))
    .catch(() => console.log('❌ Supabase service file not accessible'));
    
} catch (error) {
  console.error('❌ Error checking modules:', error);
}

// Step 2: Test Supabase auth directly
console.log('\n3. Testing Supabase auth...');

// Helper function to test Supabase
async function testSupabaseAuth() {
  try {
    // Try to import supabase
    const { supabase } = await import('./shared/services/supabase.js');
    
    console.log('✅ Supabase imported successfully');
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return false;
    }
    
    if (!session) {
      console.log('❌ No active session');
      return false;
    }
    
    console.log('✅ Active session found for user:', session.user.email);
    
    // Test getting user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          id,
          name,
          domain,
          industry,
          logo_url,
          subscription_plan
        )
      `)
      .eq('id', session.user.id)
      .single();
    
    if (userError) {
      console.error('❌ User query error:', userError);
      return false;
    }
    
    console.log('✅ User data from database:', {
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      company_id: userData.company_id,
      companies: userData.companies
    });
    
    if (!userData.companies) {
      console.log('❌ No company data found for user');
      return false;
    }
    
    console.log('✅ Company data found:', userData.companies);
    
    // Test getting company settings
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', userData.companies.id)
      .single();
    
    if (companyError) {
      console.error('❌ Company query error:', companyError);
      return false;
    }
    
    console.log('✅ Company settings from database:', companyData);
    
    return {
      session,
      userData,
      companyData
    };
    
  } catch (error) {
    console.error('❌ Error testing Supabase auth:', error);
    return false;
  }
}

// Step 3: Test AuthContext
async function testAuthContext() {
  console.log('\n4. Testing AuthContext...');
  
  try {
    // Try to access the React context
    const authContextElement = document.querySelector('[data-auth-provider]');
    if (authContextElement) {
      console.log('✅ AuthProvider found in DOM');
    } else {
      console.log('❌ AuthProvider not found in DOM');
    }
    
    // Check if we can access the global state (if exposed)
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools available - check Components tab');
    }
    
  } catch (error) {
    console.error('❌ Error testing AuthContext:', error);
  }
}

// Step 4: Test Settings Service directly
async function testSettingsService() {
  console.log('\n5. Testing Settings Service...');
  
  try {
    const result = await testSupabaseAuth();
    if (!result) {
      console.log('❌ Cannot test settings service - auth test failed');
      return false;
    }
    
    const { settingsService } = await import('./shared/services/settingsService.js');
    console.log('✅ Settings service imported');
    
    const companyId = result.userData.companies.id;
    console.log('Using company ID:', companyId);
    
    const settings = await settingsService.getCompanySettings(companyId);
    console.log('✅ Company settings loaded via service:', settings);
    
    return settings;
    
  } catch (error) {
    console.error('❌ Error testing settings service:', error);
    return false;
  }
}

// Run all tests
async function runDebugTests() {
  console.log('🚀 Running all debug tests...\n');
  
  await testSupabaseAuth();
  await testAuthContext();
  await testSettingsService();
  
  console.log('\n✅ Debug tests completed!');
  console.log('📋 Next steps:');
  console.log('1. Check if user has company data in the database');
  console.log('2. Verify AuthContext is providing company info');
  console.log('3. Check if useSettings hook is receiving the data');
}

// Expose functions globally for manual testing
window.debugSettings = {
  testSupabaseAuth,
  testAuthContext,
  testSettingsService,
  runDebugTests
};

console.log('✅ Debug functions loaded!');
console.log('Run: debugSettings.runDebugTests()'); 