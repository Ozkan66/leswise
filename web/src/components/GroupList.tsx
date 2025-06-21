import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Group } from "../types/database";

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
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
        .select("group_id, groups(id, name, jumper_code, created_by), role")
        .eq("user_id", user.id);

      if (error || !data) {
        setGroups([]);
      } else {
        setGroups(data.map((gm: any) => ({ ...gm.groups, role: gm.role }))); // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      setLoading(false);
    };
    fetchGroups();
  }, []);

  if (loading) return <div>Loading groups...</div>;
  if (!groups.length) return <div>No groups found.</div>;

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
    // Refresh
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setGroups([]);
      return;
    }
    const { data } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name, jumper_code, created_by), role")
      .eq("user_id", user.id);
    if (data) {
      setGroups(data.map((gm: any) => ({ ...gm.groups, role: gm.role }))); // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      setGroups([]);
    }
  };

  const handleDelete = async (group: Group) => {
    if (!window.confirm(`Delete group '${group.name}'? This cannot be undone.`)) return;
    await supabase.from("groups").delete().eq("id", group.id);
    // Refresh
    setGroups(groups.filter((g) => g.id !== group.id));
  };

  return (
    <div>
      <h2>Your Groups</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            {editingId === group.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                />
                <button style={{ marginLeft: 8 }} onClick={() => handleEditSave(group)}>Save</button>
                <button style={{ marginLeft: 8 }} onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {group.name} (Code: {group.jumper_code})
                {group.role === 'leader' && (
                  <>
                    <button style={{ marginLeft: 8 }} onClick={() => handleEdit(group)}>Edit</button>
                    <button style={{ marginLeft: 8, color: 'red' }} onClick={() => handleDelete(group)}>Delete</button>
                  </>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

