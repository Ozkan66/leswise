"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

interface SecurityEventDetails {
  method?: string;
  provider?: string;
  error_message?: string;
  [key: string]: unknown;
}

interface SecurityLog {
  id: number;
  event_type: string;
  event_details: SecurityEventDetails | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function SecurityLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // For now, we'll get logs for the current user only
      // In a real admin system, this would fetch all logs or logs for a selected user
      const { data, error } = await supabase.rpc('get_user_security_logs', {
        p_user_id: user?.id,
        p_limit: 50
      });

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchSecurityLogs();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchSecurityLogs]);

  const formatEventType = (eventType: string): string => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1>Toegang geweigerd</h1>
        <p>Je moet ingelogd zijn om security logs te bekijken.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Security Logs</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#666' }}>
          Deze pagina toont beveiligingsgebeurtenissen voor je account. 
          In een volledige admin-implementatie zouden beheerders alle gebruikerslogs kunnen bekijken.
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          Fout bij ophalen logs: {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Logs laden...</p>
        </div>
      ) : logs.length === 0 ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px' 
        }}>
          <p>Geen security logs gevonden.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderRadius: '6px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: 'bold'
                }}>
                  Datum & Tijd
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: 'bold'
                }}>
                  Event Type
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: 'bold'
                }}>
                  Details
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: 'bold'
                }}>
                  User Agent
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id} style={{ 
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                }}>
                  <td style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '14px'
                  }}>
                    {formatDate(log.created_at)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '14px'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: getEventTypeColor(log.event_type),
                      color: 'white'
                    }}>
                      {formatEventType(log.event_type)}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '14px'
                  }}>
                    {log.event_details ? (
                      <details>
                        <summary style={{ cursor: 'pointer' }}>Details</summary>
                        <pre style={{ 
                          fontSize: '12px', 
                          backgroundColor: '#f1f3f4', 
                          padding: '8px', 
                          borderRadius: '4px',
                          marginTop: '8px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(log.event_details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      <span style={{ color: '#666' }}>-</span>
                    )}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '12px',
                    maxWidth: '200px',
                    wordBreak: 'break-all'
                  }}>
                    {log.user_agent ? (
                      <span title={log.user_agent}>
                        {log.user_agent.length > 50 
                          ? `${log.user_agent.substring(0, 50)}...` 
                          : log.user_agent
                        }
                      </span>
                    ) : (
                      <span style={{ color: '#666' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getEventTypeColor(eventType: string): string {
  switch (eventType) {
    case 'login_success':
    case 'oauth_login_success':
    case 'password_changed':
    case 'password_reset_completed':
      return '#28a745'; // Green for successful events
    case 'login_failed':
    case 'oauth_login_failed':
      return '#dc3545'; // Red for failed events
    case 'logout':
      return '#6c757d'; // Gray for neutral events
    case 'password_reset_requested':
      return '#ffc107'; // Yellow for warning/request events
    default:
      return '#007bff'; // Blue for other events
  }
}