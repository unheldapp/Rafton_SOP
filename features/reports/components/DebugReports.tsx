import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { useAuth } from '../../../shared/context/AuthContext';
import { supabase } from '../../../shared/services/supabase';

export function DebugReports() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testDatabaseQueries = async () => {
    if (!currentUser?.company_id) {
      console.error('No company ID found');
      return;
    }

    setLoading(true);
    const testResults: any = {};

    try {
      console.log('=== DEBUGGING REPORTS ===');
      console.log('Current User:', currentUser);
      console.log('Company ID:', currentUser.company_id);

      // Test 1: Check if SOPs exist
      console.log('1. Testing SOPs...');
      const { data: sops, error: sopsError, count: sopsCount } = await supabase
        .from('sops')
        .select('*', { count: 'exact' })
        .eq('company_id', currentUser.company_id)
        .is('deleted_at', null);
      
      testResults.sops = { data: sops, error: sopsError, count: sopsCount };
      console.log('SOPs result:', { count: sopsCount, error: sopsError });

      // Test 2: Check if users exist
      console.log('2. Testing Users...');
      const { data: users, error: usersError, count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('company_id', currentUser.company_id)
        .is('deleted_at', null);
      
      testResults.users = { data: users, error: usersError, count: usersCount };
      console.log('Users result:', { count: usersCount, error: usersError });

      // Test 3: Check if assignments exist
      console.log('3. Testing SOP Assignments...');
      const { data: assignments, error: assignmentsError, count: assignmentsCount } = await supabase
        .from('sop_assignments')
        .select('*', { count: 'exact' });
      
      testResults.assignments = { data: assignments, error: assignmentsError, count: assignmentsCount };
      console.log('Assignments result:', { count: assignmentsCount, error: assignmentsError });

      // Test 4: Test acknowledgment report query
      console.log('4. Testing Acknowledgment Report Query...');
      const { data: ackData, error: ackError, count: ackCount } = await supabase
        .from('sop_assignments')
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
        `, { count: 'exact' })
        .eq('sops.company_id', currentUser.company_id);
      
      testResults.acknowledgmentQuery = { data: ackData, error: ackError, count: ackCount };
      console.log('Acknowledgment query result:', { count: ackCount, error: ackError });

      // Test 5: Check audit logs
      console.log('5. Testing Audit Logs...');
      const { data: auditData, error: auditError, count: auditCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('company_id', currentUser.company_id);
      
      testResults.auditLogs = { data: auditData, error: auditError, count: auditCount };
      console.log('Audit logs result:', { count: auditCount, error: auditError });

      console.log('=== ALL TEST RESULTS ===');
      console.log(testResults);
      setResults(testResults);

    } catch (error) {
      console.error('Error during testing:', error);
      testResults.globalError = error;
      setResults(testResults);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    if (!currentUser?.company_id) {
      console.error('No company ID found');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating test SOP assignment...');
      
      // Get a SOP from the database
      const { data: sops } = await supabase
        .from('sops')
        .select('id')
        .eq('company_id', currentUser.company_id)
        .limit(1);

      // Get a user from the database (not the current user)
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', currentUser.company_id)
        .neq('id', currentUser.id)
        .limit(1);

      if (sops && sops.length > 0 && users && users.length > 0) {
        const { data: assignment, error } = await supabase
          .from('sop_assignments')
          .insert([{
            sop_id: sops[0].id,
            user_id: users[0].id,
            assigned_by: currentUser.id,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            priority: 'medium',
            status: 'pending',
            notes: 'Test assignment created by debug tool'
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating test assignment:', error);
        } else {
          console.log('Test assignment created:', assignment);
          alert('Test assignment created successfully!');
        }
      } else {
        console.error('No SOPs or users found to create test assignment');
        alert('No SOPs or users found to create test assignment');
      }
    } catch (error) {
      console.error('Error creating test data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🐛 Reports Debug Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button 
                onClick={testDatabaseQueries}
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading ? 'Testing...' : 'Test Database Queries'}
              </Button>
              <Button 
                onClick={createTestData}
                disabled={loading}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {loading ? 'Creating...' : 'Create Test Assignment'}
              </Button>
            </div>

            {currentUser && (
              <div className="text-sm bg-gray-100 p-3 rounded">
                <strong>Current User Info:</strong><br/>
                ID: {currentUser.id}<br/>
                Email: {currentUser.email}<br/>
                Company ID: {currentUser.company_id}<br/>
                Role: {currentUser.role}
              </div>
            )}

            {Object.keys(results).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Test Results:</h3>
                {Object.entries(results).map(([key, result]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-3 rounded border ${
                      result.error 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <strong>{key.toUpperCase()}</strong>
                        <div className="text-sm text-gray-600">
                          Count: {result.count ?? 'N/A'}
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {result.error.message}
                          </div>
                        )}
                        {result.data && result.data.length > 0 && (
                          <div className="text-sm text-gray-600">
                            Sample: {JSON.stringify(result.data[0], null, 2).slice(0, 200)}...
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        result.error 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.error ? 'ERROR' : 'SUCCESS'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 