import { supabase } from '../services/supabase';

export interface RLSDebugInfo {
  hasValidSession: boolean;
  userId: string | null;
  userRole: string | null;
  error?: string;
}

export async function debugRLSState(): Promise<RLSDebugInfo> {
  try {
    // Check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return {
        hasValidSession: false,
        userId: null,
        userRole: null,
        error: `Session error: ${sessionError.message}`
      };
    }

    if (!session) {
      return {
        hasValidSession: false,
        userId: null,
        userRole: null,
        error: 'No active session'
      };
    }

    // Check user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        hasValidSession: false,
        userId: null,
        userRole: null,
        error: `User error: ${userError?.message || 'No user found'}`
      };
    }

    // Try to get user role from database
    let userRole = null;
    try {
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!dbError && userData) {
        userRole = userData.role;
      }
    } catch (dbError) {
      console.log('Could not fetch user role from database:', dbError);
    }

    return {
      hasValidSession: true,
      userId: user.id,
      userRole,
      error: undefined
    };

  } catch (error) {
    return {
      hasValidSession: false,
      userId: null,
      userRole: null,
      error: `Debug error: ${error}`
    };
  }
}

export async function checkTablePermissions(tableName: string, operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE') {
  try {
    const debugInfo = await debugRLSState();
    console.log(`RLS Debug for ${tableName} ${operation}:`, debugInfo);

    switch (operation) {
      case 'SELECT':
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`${tableName} SELECT permission error:`, error);
          return { success: false, error: error.message };
        }
        
        console.log(`${tableName} SELECT permission: OK`);
        return { success: true };

      case 'INSERT':
        // We can't test INSERT without actually inserting, so we'll just check if we can prepare the query
        console.log(`${tableName} INSERT permission: Cannot test without actual data`);
        return { success: true, note: 'Cannot test INSERT without actual data' };

      default:
        return { success: false, error: 'Unsupported operation for permission check' };
    }
  } catch (error) {
    console.error(`Permission check error for ${tableName}:`, error);
    return { success: false, error: String(error) };
  }
}

export async function createCompanyWithRetry(companyData: any, maxRetries = 3) {
  console.log('Attempting to create company with retry logic...');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Company creation attempt ${attempt}/${maxRetries}`);
    
    // Debug RLS state before attempt
    const debugInfo = await debugRLSState();
    console.log(`Attempt ${attempt} RLS debug:`, debugInfo);

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (error.code === '42501') {
          console.log('RLS policy violation detected');
          
          if (attempt === maxRetries) {
            // On final attempt, try to provide more specific error info
            await checkTablePermissions('companies', 'SELECT');
            await checkTablePermissions('companies', 'INSERT');
            
            return {
              success: false,
              error: 'Row Level Security is blocking company creation. This usually happens when:\n' +
                     '1. The user session is not properly established\n' +
                     '2. RLS policies are too restrictive\n' +
                     '3. The user doesn\'t have the required role\n\n' +
                     'Please check your RLS policies or contact support.',
              rlsError: true
            };
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        } else {
          // Non-RLS error, don't retry
          return { success: false, error: error.message };
        }
      }

      console.log(`Company created successfully on attempt ${attempt}`);
      return { success: true, data };

    } catch (error) {
      console.error(`Attempt ${attempt} exception:`, error);
      
      if (attempt === maxRetries) {
        return { success: false, error: String(error) };
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

export function logRLSError(error: any, context: string) {
  console.group(`🚨 RLS Error in ${context}`);
  console.error('Error details:', error);
  console.log('Error code:', error.code);
  console.log('Error message:', error.message);
  
  if (error.code === '42501') {
    console.log('💡 This is a Row Level Security policy violation');
    console.log('Common causes:');
    console.log('- User session not properly established');
    console.log('- RLS policies are too restrictive');
    console.log('- Missing required user role');
    console.log('- Company context not set properly');
  }
  
  console.groupEnd();
} 