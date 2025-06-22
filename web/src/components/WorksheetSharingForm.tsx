import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { User, Group, WorksheetShare, AnonymousLink } from "../types/database";

interface WorksheetSharingFormProps {
  worksheetId: string;
  worksheetTitle: string;
  onClose: () => void;
  onShared?: () => void;
}

export default function WorksheetSharingForm({ 
  worksheetId, 
  worksheetTitle, 
  onClose, 
  onShared 
}: WorksheetSharingFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [existingShares, setExistingShares] = useState<WorksheetShare[]>([]);
  const [anonymousLinks, setAnonymousLinks] = useState<AnonymousLink[]>([]);
  
  // Form state for new share
  const [shareTarget, setShareTarget] = useState<'user' | 'group'>('user');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'read' | 'submit' | 'edit'>('submit');
  const [maxAttempts, setMaxAttempts] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<string>('');
  
  // Anonymous link form state
  const [showAnonymousForm, setShowAnonymousForm] = useState(false);
  const [anonymousMaxAttempts, setAnonymousMaxAttempts] = useState<string>('');
  const [anonymousExpiresIn, setAnonymousExpiresIn] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch users (teachers and students for sharing)
      const { data: usersData } = await supabase
        .from('user_roles')
        .select('user_id, role, users!inner(id, email, first_name, last_name)')
        .in('role', ['teacher', 'student']);
      
      type UserRoleData = {
        users?: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
        };
        role: string;
      };
      
      const usersList = usersData?.map((ur: UserRoleData) => ({
        id: ur.users?.id || '',
        email: ur.users?.email || '',
        firstName: ur.users?.first_name,
        lastName: ur.users?.last_name,
        role: ur.role
      })).filter(u => u.id) || [];
      setUsers(usersList as User[]);

      // Fetch user's groups
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: groupsData } = await supabase
          .from('groups')
          .select('id, name, description')
          .eq('owner_id', user.id);
        setGroups(groupsData || []);
      }

      // Fetch existing shares
      const { data: sharesData } = await supabase
        .from('worksheet_shares')
        .select(`
          *
        `)
        .eq('worksheet_id', worksheetId);
      setExistingShares(sharesData || []);
   
      // Fetch anonymous links  
      const { data: linksData } = await supabase
        .from('anonymous_links')
        .select('*')
        .match({ worksheet_id: worksheetId, is_active: true });
      setAnonymousLinks(linksData || []);

    } catch (err) {
      setError('Failed to load sharing data');
      console.error(err);
      return; // Prevent further execution so error is not overwritten
    } finally {
      setLoading(false);
    }
  }, [worksheetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId && !selectedGroupId) {
      setError('Please select a user or group to share with');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      interface ShareData {
        worksheet_id: string;
        shared_by_user_id: string;
        permission_level: string;
        max_attempts: number | null;
        expires_at: string | null;
        shared_with_user_id?: string;
        shared_with_group_id?: string;
      }

      const shareData: ShareData = {
        worksheet_id: worksheetId,
        shared_by_user_id: user.id,
        permission_level: permissionLevel,
        max_attempts: maxAttempts ? parseInt(maxAttempts) : null,
        expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString() : null,
      };

      if (shareTarget === 'user') {
        shareData.shared_with_user_id = selectedUserId;
      } else {
        shareData.shared_with_group_id = selectedGroupId;
      }

      const { error: shareError } = await supabase
        .from('worksheet_shares')
        .insert([shareData]);

      if (shareError) throw shareError;

      // Reset form
      setSelectedUserId('');
      setSelectedGroupId('');
      setPermissionLevel('submit');
      setMaxAttempts('');
      setExpiresIn('');
      
      await fetchData(); // Refresh the shares list
      if (onShared) onShared();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share worksheet';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnonymousLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      // Generate unique link code
      const { data: linkCode } = await supabase.rpc('generate_link_code');
      
      const linkData = {
        worksheet_id: worksheetId,
        created_by_user_id: user.id,
        link_code: linkCode,
        max_attempts: anonymousMaxAttempts ? parseInt(anonymousMaxAttempts) : null,
        expires_at: anonymousExpiresIn ? new Date(Date.now() + parseInt(anonymousExpiresIn) * 24 * 60 * 60 * 1000).toISOString() : null,
      };

      const { error: linkError } = await supabase
        .from('anonymous_links')
        .insert([linkData]);

      if (linkError) throw linkError;

      setShowAnonymousForm(false);
      setAnonymousMaxAttempts('');
      setAnonymousExpiresIn('');
      
      await fetchData();
      if (onShared) onShared();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create anonymous link';
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete share';
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate link';
      setError(errorMessage);
    }
  };

  const getShareUrl = (linkCode: string) => {
    return `${window.location.origin}/worksheet-submission?anonymous=${linkCode}`;
  };

  if (loading && existingShares.length === 0) {
    return <div>Loading sharing options...</div>;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '24px', 
        borderRadius: '8px', 
        maxWidth: '800px', 
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Share: {worksheetTitle}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '16px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {/* Existing Shares */}
        {existingShares.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3>Current Shares</h3>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {existingShares.map(share => (
                <div key={share.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px',
                  margin: '4px 0',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  <div>
                    <strong>
                      {share.shared_with_user_id ? `User ID: ${share.shared_with_user_id}` : `Group ID: ${share.shared_with_group_id}`}
                    </strong>
                    <span style={{ marginLeft: '8px', fontSize: '0.9em', color: '#666' }}>
                      ({share.permission_level})
                      {share.max_attempts && ` - ${share.attempts_used}/${share.max_attempts} attempts`}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteShare(share.id)}
                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anonymous Links */}
        {anonymousLinks.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3>Anonymous Links</h3>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {anonymousLinks.map(link => (
                <div key={link.id} style={{ 
                  padding: '8px',
                  margin: '4px 0',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <code style={{ fontSize: '0.9em' }}>{getShareUrl(link.link_code)}</code>
                      <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
                        {link.max_attempts && `${link.attempts_used}/${link.max_attempts} attempts used`}
                        {link.expires_at && ` • Expires: ${new Date(link.expires_at).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(getShareUrl(link.link_code))}
                      style={{ marginRight: '8px', padding: '4px 8px', fontSize: '0.8em' }}
                    >
                      Copy
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDeactivateLink(link.id)}
                    style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8em', marginTop: '4px' }}
                  >
                    Deactivate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share with Users/Groups Form */}
        <form onSubmit={handleShareSubmit} style={{ marginBottom: '24px' }}>
          <h3>Share with Users or Groups</h3>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ marginRight: '16px' }}>
              <input
                type="radio"
                value="user"
                checked={shareTarget === 'user'}
                onChange={(e) => setShareTarget(e.target.value as 'user')}
                style={{ marginRight: '4px' }}
              />
              Share with User
            </label>
            <label>
              <input
                type="radio"
                value="group"
                checked={shareTarget === 'group'}
                onChange={(e) => setShareTarget(e.target.value as 'group')}
                style={{ marginRight: '4px' }}
              />
              Share with Group
            </label>
          </div>

          {shareTarget === 'user' ? (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Select User:</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
                required
              >
                <option value="">Choose a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} ({user.firstName} {user.lastName})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Select Group:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
                required
              >
                <option value="">Choose a group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Permission Level:</label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as 'read' | 'submit' | 'edit')}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="read">Read only (can view)</option>
              <option value="submit">Submit (can complete worksheet)</option>
              <option value="edit">Edit (can modify worksheet)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Max Attempts (optional):</label>
              <input
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                placeholder="Unlimited"
                min="1"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Expires in (days, optional):</label>
              <input
                type="number"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                placeholder="Never expires"
                min="1"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {loading ? 'Sharing...' : 'Share Worksheet'}
          </button>
        </form>

        {/* Anonymous Link Form */}
        <div>
          <h3>Anonymous Sharing</h3>
          {!showAnonymousForm ? (
            <button
              onClick={() => setShowAnonymousForm(true)}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Create Anonymous Link
            </button>
          ) : (
            <form onSubmit={handleCreateAnonymousLink}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Max Attempts (optional):</label>
                  <input
                    type="number"
                    value={anonymousMaxAttempts}
                    onChange={(e) => setAnonymousMaxAttempts(e.target.value)}
                    placeholder="Unlimited"
                    min="1"
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Expires in (days, optional):</label>
                  <input
                    type="number"
                    value={anonymousExpiresIn}
                    onChange={(e) => setAnonymousExpiresIn(e.target.value)}
                    placeholder="Never expires"
                    min="1"
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
              </div>
              
              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginRight: '8px' }}
                >
                  {loading ? 'Creating...' : 'Create Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnonymousForm(false)}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
