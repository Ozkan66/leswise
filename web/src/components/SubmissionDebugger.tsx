'use client';

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Debug component to test submission functionality
 * Add this to any page to test the submission fix
 */
export default function SubmissionDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSubmissionFlow = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('🧪 Starting submission flow test...');

    try {
      // Test 1: Check authentication
      addLog('📋 Test 1: Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addLog(`❌ Auth error: ${authError.message}`);
        return;
      }
      
      if (!user) {
        addLog('❌ No user found - please log in first');
        return;
      }
      
      addLog(`✅ User authenticated: ${user.id}`);

      // Test 2: Check user profile
      addLog('📋 Test 2: Checking user profile...');
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('user_id, role')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        addLog(`❌ Profile error: ${profileError.message}`);
        if (profileError.message.includes('permission denied')) {
          addLog('💡 This might be expected due to RLS policies');
        }
      } else {
        addLog(`✅ User profile found: ${userProfile.role}`);
      }

      // Test 3: Test worksheet access function
      addLog('📋 Test 3: Testing worksheet access function...');
      const dummyWorksheetId = '00000000-0000-0000-0000-000000000000';
      
      const { data: hasAccess, error: accessError } = await supabase
        .rpc('user_has_worksheet_access', {
          p_user_id: user.id,
          p_worksheet_id: dummyWorksheetId,
          p_required_permission: 'submit'
        });

      if (accessError) {
        addLog(`❌ Access check error: ${accessError.message}`);
      } else {
        addLog(`✅ Access check completed: ${hasAccess}`);
      }

      // Test 4: Test attempt check function
      addLog('📋 Test 4: Testing attempt limit function...');
      const { data: canAttempt, error: attemptError } = await supabase
        .rpc('check_and_increment_attempts', {
          p_user_id: user.id,
          p_worksheet_id: dummyWorksheetId,
          p_anonymous_link_id: null
        });

      if (attemptError) {
        addLog(`❌ Attempt check error: ${attemptError.message}`);
      } else {
        addLog(`✅ Attempt check completed: ${canAttempt}`);
      }

      // Test 5: Check submissions table access
      addLog('📋 Test 5: Testing submissions table access...');
      const { data: submissions, error: submissionError } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (submissionError) {
        addLog(`❌ Submissions query error: ${submissionError.message}`);
        if (submissionError.message.includes('permission denied')) {
          addLog('💡 Permission denied is expected if user has no submissions');
        }
      } else {
        addLog(`✅ Submissions query succeeded: ${submissions?.length || 0} records`);
      }

      addLog('🎯 Test completed! Check console for detailed logs.');

    } catch (error) {
      addLog(`❌ Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ 
      margin: '20px', 
      padding: '20px', 
      border: '2px solid #e5e7eb', 
      borderRadius: '8px',
      backgroundColor: '#f9fafb'
    }}>
      <h3 style={{ color: '#374151', marginBottom: '16px' }}>
        🔧 Submission Debugger (Issue #156)
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={testSubmissionFlow}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '8px'
          }}
        >
          {isLoading ? 'Testing...' : 'Run Submission Tests'}
        </button>
        
        <button
          onClick={clearLogs}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Logs
        </button>
      </div>

      <div style={{
        backgroundColor: '#1f2937',
        color: '#e5e7eb',
        padding: '12px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {logs.length === 0 ? (
          <div style={{ color: '#9ca3af' }}>Click &quot;Run Submission Tests&quot; to start debugging...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
        <strong>Note:</strong> This debugger tests the submission flow without actually creating submissions.
        Permission denied errors are often expected due to RLS policies.
      </div>
    </div>
  );
}
