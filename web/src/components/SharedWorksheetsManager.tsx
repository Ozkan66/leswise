import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { WorksheetShare, AnonymousLink, AnonymousSubmission } from "../types/database";

export default function SharedWorksheetsManager() {
  const [shares, setShares] = useState<WorksheetShare[]>([]);
  const [anonymousLinks, setAnonymousLinks] = useState<AnonymousLink[]>([]);
  const [anonymousSubmissions, setAnonymousSubmissions] = useState<AnonymousSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'shares' | 'anonymous'>('shares');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setError('Please log in to view shared worksheets');
        return;
      }

      // Fetch worksheet shares created by the user
      const { data: sharesData, error: sharesError } = await supabase
        .from('worksheet_shares')
        .select(`
          *,
          worksheets(id, title)
        `)
        .eq('shared_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (sharesError) throw sharesError;
      setShares(sharesData || []);

      // Fetch anonymous links created by the user
      const { data: linksData, error: linksError } = await supabase
        .from('anonymous_links')
        .select(`
          *,
          worksheets(id, title)
        `)
        .eq('created_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      setAnonymousLinks(linksData || []);

      // Fetch anonymous submissions for user's worksheets
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('anonymous_submissions')
        .select(`
          *,
          anonymous_links(link_code, worksheets(title))
        `)
        .in('worksheet_id', linksData?.map(l => l.worksheet_id) || [])
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      setAnonymousSubmissions(submissionsData || []);

    } catch (err: any) {
      setError(err.message || 'Failed to load sharing data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    if (!window.confirm('Are you sure you want to remove this share?')) return;
    
    try {
      const { error } = await supabase
        .from('worksheet_shares')
        .delete()
        .eq('id', shareId);
      
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete share');
    }
  };

  const handleDeactivateLink = async (linkId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this anonymous link?')) return;
    
    try {
      const { error } = await supabase
        .from('anonymous_links')
        .update({ is_active: false })
        .eq('id', linkId);
      
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate link');
    }
  };

  const handleResetAttempts = async (shareId: string, type: 'share' | 'link') => {
    if (!window.confirm('Are you sure you want to reset the attempt count?')) return;
    
    try {
      const table = type === 'share' ? 'worksheet_shares' : 'anonymous_links';
      const { error } = await supabase
        .from(table)
        .update({ attempts_used: 0 })
        .eq('id', shareId);
      
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to reset attempts');
    }
  };

  const getShareUrl = (linkCode: string) => {
    return `${window.location.origin}/worksheet-submission?anonymous=${linkCode}`;
  };

  if (loading) return <div>Loading shared worksheets...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1>Shared Worksheets Management</h1>
      
      {error && (
        <div style={{ 
          color: 'red', 
          marginBottom: '16px', 
          padding: '8px', 
          backgroundColor: '#ffebee', 
          borderRadius: '4px' 
        }}>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => setSelectedTab('shares')}
          style={{
            padding: '8px 16px',
            marginRight: '8px',
            backgroundColor: selectedTab === 'shares' ? '#007bff' : '#e9ecef',
            color: selectedTab === 'shares' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Direct Shares ({shares.length})
        </button>
        <button
          onClick={() => setSelectedTab('anonymous')}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedTab === 'anonymous' ? '#007bff' : '#e9ecef',
            color: selectedTab === 'anonymous' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Anonymous Links ({anonymousLinks.length})
        </button>
      </div>

      {selectedTab === 'shares' && (
        <div>
          <h2>Direct Worksheet Shares</h2>
          {shares.length === 0 ? (
            <p>No direct shares found. Share worksheets with specific users or groups to see them here.</p>
          ) : (
            <div>
              {shares.map(share => (
                <div key={share.id} style={{ 
                  marginBottom: '16px', 
                  padding: '16px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>
                        {(share as any).worksheets?.title || 'Unknown Worksheet'}
                      </h3>
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                        <strong>Shared with:</strong> {
                          share.shared_with_user_id 
                            ? `User ID: ${share.shared_with_user_id}` 
                            : `Group ID: ${share.shared_with_group_id}`
                        }
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                        <strong>Permission:</strong> {share.permission_level}
                      </div>
                      {share.max_attempts && (
                        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                          <strong>Attempts:</strong> {share.attempts_used} / {share.max_attempts}
                        </div>
                      )}
                      {share.expires_at && (
                        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                          <strong>Expires:</strong> {new Date(share.expires_at).toLocaleDateString()}
                        </div>
                      )}
                      <div style={{ fontSize: '0.8em', color: '#888' }}>
                        Created: {new Date(share.created_at!).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div style={{ marginLeft: '16px' }}>
                      {share.max_attempts && (
                        <button
                          onClick={() => handleResetAttempts(share.id, 'share')}
                          style={{ 
                            marginRight: '8px', 
                            padding: '4px 8px', 
                            backgroundColor: '#ffc107',
                            color: 'black',
                            border: 'none',
                            borderRadius: '3px',
                            fontSize: '0.8em'
                          }}
                        >
                          Reset Attempts
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteShare(share.id)}
                        style={{ 
                          color: 'red', 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          padding: '4px 8px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'anonymous' && (
        <div>
          <h2>Anonymous Links</h2>
          {anonymousLinks.length === 0 ? (
            <p>No anonymous links found. Create anonymous sharing links to see them here.</p>
          ) : (
            <div>
              {anonymousLinks.map(link => {
                const linkSubmissions = anonymousSubmissions.filter(s => s.anonymous_link_id === link.id);
                
                return (
                  <div key={link.id} style={{ 
                    marginBottom: '16px', 
                    padding: '16px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    backgroundColor: link.is_active ? '#e8f5e8' : '#ffebee'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>
                          {(link as any).worksheets?.title || 'Unknown Worksheet'}
                        </h3>
                        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                          <strong>Status:</strong> {link.is_active ? 'Active' : 'Inactive'}
                        </div>
                        <div style={{ fontSize: '0.9em', marginBottom: '8px' }}>
                          <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '3px' }}>
                            {getShareUrl(link.link_code)}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(getShareUrl(link.link_code))}
                            style={{ 
                              marginLeft: '8px', 
                              padding: '2px 6px', 
                              fontSize: '0.8em',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px'
                            }}
                          >
                            Copy
                          </button>
                        </div>
                        {link.max_attempts && (
                          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                            <strong>Attempts:</strong> {link.attempts_used} / {link.max_attempts}
                          </div>
                        )}
                        {link.expires_at && (
                          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                            <strong>Expires:</strong> {new Date(link.expires_at).toLocaleDateString()}
                          </div>
                        )}
                        <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                          <strong>Submissions:</strong> {linkSubmissions.length}
                        </div>
                        <div style={{ fontSize: '0.8em', color: '#888' }}>
                          Created: {new Date(link.created_at!).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div style={{ marginLeft: '16px' }}>
                        {link.max_attempts && link.is_active && (
                          <button
                            onClick={() => handleResetAttempts(link.id, 'link')}
                            style={{ 
                              marginRight: '8px', 
                              padding: '4px 8px', 
                              backgroundColor: '#ffc107',
                              color: 'black',
                              border: 'none',
                              borderRadius: '3px',
                              fontSize: '0.8em'
                            }}
                          >
                            Reset Attempts
                          </button>
                        )}
                        {link.is_active && (
                          <button
                            onClick={() => handleDeactivateLink(link.id)}
                            style={{ 
                              color: 'red', 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer',
                              padding: '4px 8px'
                            }}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Show recent submissions */}
                    {linkSubmissions.length > 0 && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9em' }}>Recent Submissions:</h4>
                        <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                          {linkSubmissions.slice(0, 5).map(submission => (
                            <div key={submission.id} style={{ 
                              fontSize: '0.8em', 
                              color: '#666', 
                              marginBottom: '4px',
                              padding: '4px 8px',
                              backgroundColor: 'white',
                              borderRadius: '3px'
                            }}>
                              <strong>{submission.participant_name || 'Anonymous'}</strong> - {new Date(submission.created_at!).toLocaleString()}
                            </div>
                          ))}
                          {linkSubmissions.length > 5 && (
                            <div style={{ fontSize: '0.8em', color: '#888', fontStyle: 'italic' }}>
                              ... and {linkSubmissions.length - 5} more submissions
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}