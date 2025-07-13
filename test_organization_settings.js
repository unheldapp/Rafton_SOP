// Test Organization Settings Integration
// Run this in the browser console when logged in to test the settings functionality

console.log('🧪 Testing Organization Settings Integration...');

// Test 1: Check if user is properly loaded with company info
async function testUserLoad() {
  console.log('\n1. Testing user load with company info...');
  
  try {
    const { useAuth } = await import('./shared/context/AuthContext');
    const { user } = useAuth();
    
    console.log('✅ User loaded:', {
      id: user?.id,
      email: user?.email,
      name: `${user?.firstName} ${user?.lastName}`,
      role: user?.role,
      company: user?.company ? {
        id: user.company.id,
        name: user.company.name,
        domain: user.company.domain
      } : null
    });
    
    if (!user?.company?.id) {
      console.error('❌ User company info missing!');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error loading user:', error);
    return false;
  }
}

// Test 2: Check if settings service can fetch company settings
async function testSettingsLoad() {
  console.log('\n2. Testing settings load...');
  
  try {
    const { settingsService } = await import('./shared/services/settingsService');
    const { useAuth } = await import('./shared/context/AuthContext');
    const { user } = useAuth();
    
    if (!user?.company?.id) {
      console.error('❌ No company ID available');
      return false;
    }
    
    const settings = await settingsService.getCompanySettings(user.company.id);
    
    console.log('✅ Company settings loaded:', {
      name: settings.name,
      industry: settings.industry,
      size: settings.size,
      domain: settings.domain,
      subscription_plan: settings.subscription_plan,
      settings: settings.settings
    });
    
    return settings;
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    return false;
  }
}

// Test 3: Check if settings service can update company settings
async function testSettingsUpdate() {
  console.log('\n3. Testing settings update...');
  
  try {
    const { settingsService } = await import('./shared/services/settingsService');
    const { useAuth } = await import('./shared/context/AuthContext');
    const { user } = useAuth();
    
    if (!user?.company?.id) {
      console.error('❌ No company ID available');
      return false;
    }
    
    const currentSettings = await settingsService.getCompanySettings(user.company.id);
    
    // Test update with new timezone
    const testUpdate = {
      settings: {
        ...currentSettings.settings,
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        testUpdate: new Date().toISOString()
      }
    };
    
    const updatedSettings = await settingsService.updateCompanySettings(user.company.id, testUpdate);
    
    console.log('✅ Settings updated successfully:', {
      timezone: updatedSettings.settings?.timezone,
      dateFormat: updatedSettings.settings?.dateFormat,
      testUpdate: updatedSettings.settings?.testUpdate
    });
    
    return updatedSettings;
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    return false;
  }
}

// Test 4: Check if useSettings hook works properly
async function testUseSettingsHook() {
  console.log('\n4. Testing useSettings hook...');
  
  try {
    const { useSettings } = await import('./shared/hooks/useSettings');
    const settings = useSettings();
    
    console.log('✅ useSettings hook state:', {
      loading: settings.loading,
      loadingCompanySettings: settings.loadingCompanySettings,
      hasCompanySettings: !!settings.companySettings,
      error: settings.error,
      settingsError: settings.settingsError
    });
    
    if (settings.companySettings) {
      console.log('✅ Company settings from hook:', {
        name: settings.companySettings.name,
        industry: settings.companySettings.industry,
        size: settings.companySettings.size
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error with useSettings hook:', error);
    return false;
  }
}

// Test 5: Check Supabase connection
async function testSupabaseConnection() {
  console.log('\n5. Testing Supabase connection...');
  
  try {
    const { supabase } = await import('./shared/services/supabase');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Supabase auth error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection working, user:', user?.email);
    
    // Test database query
    const { data: companies, error: queryError } = await supabase
      .from('companies')
      .select('id, name, domain')
      .limit(1);
    
    if (queryError) {
      console.error('❌ Database query error:', queryError);
      return false;
    }
    
    console.log('✅ Database query successful:', companies);
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running all organization settings tests...\n');
  
  const results = {};
  
  results.supabaseConnection = await testSupabaseConnection();
  results.userLoad = await testUserLoad();
  results.settingsLoad = await testSettingsLoad();
  results.settingsUpdate = await testSettingsUpdate();
  results.useSettingsHook = await testUseSettingsHook();
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return results;
}

// Export for use
window.testOrganizationSettings = {
  runAllTests,
  testUserLoad,
  testSettingsLoad,
  testSettingsUpdate,
  testUseSettingsHook,
  testSupabaseConnection
};

console.log('✅ Test functions loaded! Run: testOrganizationSettings.runAllTests()'); 