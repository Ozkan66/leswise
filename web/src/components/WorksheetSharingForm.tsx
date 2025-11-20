"use client";
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
        .from('user_profiles')
        .select('user_id, email, first_name, last_name, role')
        .in('role', ['teacher', 'student']);

      const usersList = usersData?.map((up) => ({
        id: up.user_id || '',
        email: up.email || '',
        firstName: up.first_name || undefined,
        lastName: up.last_name || undefined,
        role: up.role
      })).filter(u => u.id) || [];
      setUsers(usersList as User[]);

      // Fetch user's groups (where user is a member or leader)
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: groupsData } = await supabase
          .from('group_members')
          .select('group_id, groups(id, name, description, type), role')
          .match({ user_id: user.id, status: 'active' });
        const groupsList = groupsData?.map((gm: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
          ...gm.groups,
          role: gm.role
        })).filter(g => g.id) || [];
        setGroups(groupsList);
      }

      // Fetch existing shares
      const { data: sharesData } = await supabase
        .from('worksheet_shares')
        .select(`
          *,
          shared_with_user:user_profiles(email, first_name, last_name),
          shared_with_group:groups(name)
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

    // Validate that appropriate ID is selected based on shareTarget
    if (shareTarget === 'user' && !selectedUserId) {
      setError('Please select a user to share with');
      return;
    }
    if (shareTarget === 'group' && !selectedGroupId) {
      setError('Please select a group to share with');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      console.log('DEBUG SHARING: User authenticated:', user.id);
      console.log('DEBUG SHARING: Worksheet ID:', worksheetId);
      console.log('DEBUG SHARING: Share target:', shareTarget);
      console.log('DEBUG SHARING: Selected user ID:', selectedUserId);
      console.log('DEBUG SHARING: Selected group ID:', selectedGroupId);
      console.log('DEBUG SHARING: Permission level:', permissionLevel);

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

      if (shareTarget === 'user' && selectedUserId) {
        shareData.shared_with_user_id = selectedUserId;
      } else if (shareTarget === 'group' && selectedGroupId) {
        shareData.shared_with_group_id = selectedGroupId;
      }

      console.log('DEBUG SHARING: Share data to insert:', JSON.stringify(shareData, null, 2));

      // Get the current auth token
      const { data: { session } } = await supabase.auth.getSession();

      // Use our API endpoint to bypass RLS issues
      const response = await fetch('/api/worksheet-shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(shareData),
      });

      const result = await response.json();
      console.log('DEBUG SHARING: API response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create share');
      }

      console.log('DEBUG SHARING: Share created successfully!');

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
      console.error('DEBUG SHARING: Error occurred:', err);
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
      const { data: linkCode, error: rpcError } = await supabase.rpc('generate_link_code');

      if (rpcError) {
        console.error('Error generating link code:', rpcError);
        throw new Error('Failed to generate unique link code. Please try again.');
      }

      if (!linkCode) {
        throw new Error('Failed to generate unique link code. Please try again.');
      }

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

  const getShareDisplayText = (share: WorksheetShare) => {
    if (share.shared_with_user) {
      const user = share.shared_with_user;
      // Handle both possible property naming conventions from Supabase
      type UserWithOptionalNames = User & { first_name?: string; last_name?: string; };
      const userWithNames = user as UserWithOptionalNames;
      const firstName = userWithNames.first_name || user.firstName || '';
      const lastName = userWithNames.last_name || user.lastName || '';
      const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : user.email;
      return `User: ${name}`;
    }
    if (share.shared_with_group) {
      return `Group: ${share.shared_with_group.name}`;
    }
    // Fallback for older shares that might not have the joined data
    if (share.shared_with_user_id) return `User ID: ${share.shared_with_user_id}`;
    if (share.shared_with_group_id) return `Group ID: ${share.shared_with_group_id}`;
    return 'Unknown Share';
  };

  if (loading) {
    return <div>Loading sharing options...</div>;
  }

  return (
    <div className="space-y-6">

      {error && (
        <div style={{ color: 'red', marginBottom: '16px', padding: '8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Existing Shares */}
      {existingShares.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-lg font-semibold mb-4">Current Shares</h3>
          {existingShares.length > 0 ? (
            <ul className="space-y-2 mb-6 max-h-40 overflow-y-auto">
              {existingShares.map((share) => (
                <li key={share.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>
                    {getShareDisplayText(share)} ({share.permission_level}) - {share.max_attempts || 'unlimited'} attempts
                  </span>
                  <button
                    onClick={() => handleDeleteShare(share.id)}
                    className="text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No shares found for this worksheet.</p>
          )}
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
  );
}
