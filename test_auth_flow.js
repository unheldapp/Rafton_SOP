// Test Auth Flow and Settings Integration
// Run this in the browser console to debug the entire flow

console.log('🔍 Testing Complete Auth and Settings Flow...');

async function testCompleteFlow() {
  try {
    console.log('\n=== STEP 1: Testing Supabase Direct ===');
    
    // Import Supabase
    const { supabase } = await import('./shared/services/supabase.js');
    console.log('✅ Supabase imported');
    
    // Get current user from Supabase auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      console.error('❌ No authenticated user:', authError);
      return;
    }
    
    console.log('✅ Supabase auth user:', authUser.email);
    
    // Get user data with company from database
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select(`
        *,
        companies (
          id, name, domain, industry, logo_url, subscription_plan, settings
        )
      `)
      .eq('id', authUser.id)
      .single();
    
    if (dbError) {
      console.error('❌ Database user query error:', dbError);
      return;
    }
    
    console.log('✅ Database user data:', dbUser);
    console.log('✅ Company data from DB:', dbUser.companies);
    
    console.log('\n=== STEP 2: Testing AuthService ===');
    
    // Test AuthService.getCurrentUser()
    const { AuthService } = await import('./shared/services/authService.js');
    const authServiceUser = await AuthService.getCurrentUser();
    
    console.log('✅ AuthService user:', authServiceUser);
    console.log('✅ AuthService user company:', authServiceUser?.company);
    
    console.log('\n=== STEP 3: Testing Settings Service ===');
    
    if (authServiceUser?.company?.id) {
      const { settingsService } = await import('./shared/services/settingsService.js');
      const companySettings = await settingsService.getCompanySettings(authServiceUser.company.id);
      console.log('✅ Company settings from service:', companySettings);
    } else {
      console.error('❌ No company ID available from AuthService user');
    }
    
    console.log('\n=== STEP 4: Testing React Context ===');
    
    // Try to access React context (this might not work from console)
    try {
      // Check if there's a way to access the current context
      const reactElements = document.querySelectorAll('[data-reactroot], #root');
      console.log('✅ React root elements found:', reactElements.length);
      
      // Check if we can find any auth-related elements
      const authElements = document.querySelectorAll('[data-testid*="auth"], [class*="auth"]');
      console.log('✅ Auth-related elements found:', authElements.length);
      
    } catch (error) {
      console.log('ℹ️ Cannot access React context from console (expected)');
    }
    
    console.log('\n=== STEP 5: Direct Hook Test ===');
    
    // Try to test the useSettings hook directly (this will likely fail from console)
    try {
      const { useSettings } = await import('./shared/hooks/useSettings.js');
      console.log('✅ useSettings hook imported');
      // Note: Can't actually call the hook from here since it needs React context
    } catch (error) {
      console.log('ℹ️ Cannot test hook directly from console (expected)');
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('1. Supabase auth:', authUser ? '✅' : '❌');
    console.log('2. Database user:', dbUser ? '✅' : '❌');
    console.log('3. Database company:', dbUser?.companies ? '✅' : '❌');
    console.log('4. AuthService user:', authServiceUser ? '✅' : '❌');
    console.log('5. AuthService company:', authServiceUser?.company ? '✅' : '❌');
    
    if (authServiceUser && !authServiceUser.company) {
      console.log('\n🔥 ISSUE FOUND: AuthService is not properly constructing the company object!');
      console.log('Database has company data but AuthService user.company is missing');
    } else if (authServiceUser?.company) {
      console.log('\n✅ AuthService is working correctly');
      console.log('The issue might be in the React context or useAuth hook');
    }
    
    return {
      authUser,
      dbUser,
      authServiceUser,
      companyId: authServiceUser?.company?.id
    };
    
  } catch (error) {
    console.error('❌ Error in complete flow test:', error);
  }
}

// Test just the Settings component state
async function testSettingsComponentState() {
  console.log('\n=== TESTING SETTINGS COMPONENT STATE ===');
  
  try {
    // Look for the settings component in the DOM
    const settingsContainer = document.querySelector('[data-testid="settings"], .settings, [class*="settings"]');
    
    if (settingsContainer) {
      console.log('✅ Settings component found in DOM');
    } else {
      console.log('❌ Settings component not found in DOM');
    }
    
    // Check for debug output elements
    const debugElements = document.querySelectorAll('[class*="debug"], [data-testid*="debug"]');
    console.log('Debug elements found:', debugElements.length);
    
    // Check for user display elements
    const userElements = document.querySelectorAll('[class*="user"], [data-testid*="user"]');
    console.log('User-related elements found:', userElements.length);
    
  } catch (error) {
    console.error('Error testing component state:', error);
  }
}

// Run both tests
async function runCompleteTest() {
  console.log('🚀 Running Complete Auth and Settings Test...\n');
  
  const flowResult = await testCompleteFlow();
  await testSettingsComponentState();
  
  console.log('\n📋 NEXT STEPS:');
  
  if (flowResult?.authServiceUser && !flowResult.authServiceUser.company) {
    console.log('1. ❌ Fix AuthService to properly construct company object');
    console.log('2. Check the company object mapping in authService.ts');
  } else if (flowResult?.authServiceUser?.company) {
    console.log('1. ✅ AuthService is working');
    console.log('2. ❌ Check useAuth hook and AuthContext');
    console.log('3. ❌ Check if Settings component is receiving the user prop');
  } else {
    console.log('1. ❌ Basic auth flow is broken');
    console.log('2. Check database connection and user data');
  }
  
  return flowResult;
}

// Expose functions
window.testAuthFlow = {
  runCompleteTest,
  testCompleteFlow,
  testSettingsComponentState
};

console.log('✅ Auth flow test functions loaded!');
console.log('Run: testAuthFlow.runCompleteTest()'); 