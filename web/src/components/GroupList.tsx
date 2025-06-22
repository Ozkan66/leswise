import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Group } from "../types/database";
import GroupSettings from "./GroupSettings";
import GroupResults from "./GroupResults";

interface GroupMember {
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  users: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  }[];
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showMembers, setShowMembers] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<{ groupId: string; groupName: string } | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }
    // Fetch groups where user is a member
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name, description, type, jumper_code, created_by), role")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error || !data) {
      setGroups([]);
    } else {
      setGroups(data.map((gm: any) => ({ ...gm.groups, role: gm.role }))); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setLoading(false);
  };

  const fetchMembers = async (groupId: string) => {
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from("group_members")
      .select(`
        user_id,
        role,
        status,
        joined_at,
        users:user_profiles(first_name, last_name, email)
      `)
      .eq("group_id", groupId)
      .order("joined_at", { ascending: false });

    if (error || !data) {
      setMembers([]);
    } else {
      setMembers(data);
    }
    setLoadingMembers(false);
  };

  const handleShowMembers = async (groupId: string) => {
    if (showMembers === groupId) {
      setShowMembers(null);
      setMembers([]);
    } else {
      setShowMembers(groupId);
      await fetchMembers(groupId);
    }
  };

  const handleShowSettings = (groupId: string) => {
    setShowSettings(groupId);
  };

  const handleCloseSettings = () => {
    setShowSettings(null);
  };

  const handleShowResults = (groupId: string, groupName: string) => {
    setShowResults({ groupId, groupName });
  };

  const handleCloseResults = () => {
    setShowResults(null);
  };

  const handleSettingsSaved = async () => {
    await fetchGroups();
  };

  const handleApproveMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from("group_members")
      .update({ status: "active" })
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (!error) {
      await fetchMembers(groupId);
    }
  };

  const handleRejectMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (!error) {
      await fetchMembers(groupId);
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (!error) {
      await fetchMembers(groupId);
    }
  };

  if (loading) return <div>Loading groups...</div>;
  if (!groups.length) return <div>No groups found. Create a group or join one using a jumper code.</div>;

  const handleEdit = (group: Group) => {
    setEditingId(group.id);
    setEditName(group.name);
  };

  const handleEditSave = async (group: Group) => {
    if (!editName.trim() || editName === group.name) {
      setEditingId(null);
      return;
    }
    await supabase.from("groups").update({ name: editName }).eq("id", group.id);
    setEditingId(null);
    await fetchGroups();
  };

  const handleDelete = async (group: Group) => {
    if (!window.confirm(`Delete group '${group.name}'? This cannot be undone.`)) return;
    await supabase.from("groups").delete().eq("id", group.id);
    await fetchGroups();
  };

  const formatMemberName = (member: GroupMember) => {
    const user = member.users[0];
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.email || 'Unknown User';
  };

  return (
    <div>
      <h2>Your Groups</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {groups.map((group) => (
          <div key={group.id} style={{ 
            border: '1px solid #ccc', 
            borderRadius: 8, 
            padding: 16,
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              {editingId === group.id ? (
                <div style={{ flex: 1 }}>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <button 
                      style={{ marginRight: 8, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4 }} 
                      onClick={() => handleEditSave(group)}
                    >
                      Save
                    </button>
                    <button 
                      style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4 }} 
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: 4 }}>{group.name}</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: 14, color: '#666', marginBottom: 8 }}>
                    <span><strong>Type:</strong> {group.type === 'klas' ? 'Klas' : 'Community'}</span>
                    <span><strong>Role:</strong> {group.role === 'leader' ? 'Leader' : 'Member'}</span>
                    <span><strong>Code:</strong> <code style={{ backgroundColor: '#e9ecef', padding: '2px 4px', borderRadius: 2 }}>{group.jumper_code}</code></span>
                  </div>
                  {group.description && (
                    <p style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#666' }}>{group.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button 
                      style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 12 }} 
                      onClick={() => handleShowMembers(group.id)}
                    >
                      {showMembers === group.id ? 'Hide Members' : 'Show Members'}
                    </button>
                    <button 
                      style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 12 }} 
                      onClick={() => handleShowResults(group.id, group.name)}
                    >
                      View Results
                    </button>
                    {group.role === 'leader' && (
                      <>
                        <button 
                          style={{ backgroundColor: '#6f42c1', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 12 }} 
                          onClick={() => handleShowSettings(group.id)}
                        >
                          Settings
                        </button>
                        <button 
                          style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 12 }} 
                          onClick={() => handleEdit(group)}
                        >
                          Quick Edit
                        </button>
                        <button 
                          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, fontSize: 12 }} 
                          onClick={() => handleDelete(group)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Members List */}
            {showMembers === group.id && (
              <div style={{ 
                borderTop: '1px solid #ddd', 
                paddingTop: 12, 
                marginTop: 12,
                backgroundColor: 'white',
                borderRadius: 4,
                padding: 12
              }}>
                <h4 style={{ margin: 0, marginBottom: 8 }}>Members</h4>
                {loadingMembers ? (
                  <div>Loading members...</div>
                ) : members.length === 0 ? (
                  <div style={{ color: '#666' }}>No members found.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {members.map((member) => (
                      <div key={member.user_id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: 8,
                        backgroundColor: member.status === 'pending' ? '#fff3cd' : '#f8f9fa',
                        borderRadius: 4,
                        border: '1px solid #dee2e6'
                      }}>
                        <div>
                          <strong>{formatMemberName(member)}</strong>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {member.role === 'leader' ? 'Leader' : 'Member'} • 
                            {member.status === 'pending' ? ' Pending approval' : ' Active'} • 
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                        {group.role === 'leader' && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            {member.status === 'pending' && (
                              <>
                                <button 
                                  style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 2, fontSize: 11 }}
                                  onClick={() => handleApproveMember(group.id, member.user_id)}
                                >
                                  Approve
                                </button>
                                <button 
                                  style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 2, fontSize: 11 }}
                                  onClick={() => handleRejectMember(group.id, member.user_id)}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {member.status === 'active' && member.role !== 'leader' && (
                              <button 
                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 2, fontSize: 11 }}
                                onClick={() => handleRemoveMember(group.id, member.user_id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Group Settings Modal */}
      {showSettings && (
        <GroupSettings
          groupId={showSettings}
          onClose={handleCloseSettings}
          onSave={handleSettingsSaved}
        />
      )}

      {/* Group Results Modal */}
      {showResults && (
        <GroupResults
          groupId={showResults.groupId}
          groupName={showResults.groupName}
          onClose={handleCloseResults}
        />
      )}
    </div>
  );
}

