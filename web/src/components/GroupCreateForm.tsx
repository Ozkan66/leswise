import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function GroupCreateForm({ onGroupCreated }: { onGroupCreated?: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<'klas' | 'community'>('community');
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    // Generate a random jumper code
    const jumper_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert([{ name, type, description: description || null, owner_id: user.id, jumper_code }])
      .select()
      .single();

    if (groupError || !group) {
      setError(groupError?.message || "Failed to create group");
      setLoading(false);
      return;
    }

    // Add user as group leader
    await supabase
      .from("group_members")
      .insert([{ group_id: group.id, user_id: user.id, role: "leader", status: "active" }]);

    setName("");
    setType('community');
    setDescription("");
    setLoading(false);
    if (onGroupCreated) onGroupCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>Create New Group</h3>
      
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="group-name" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Group Name *
        </label>
        <input
          id="group-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          required
          style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="group-type" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Group Type *
        </label>
        <select
          id="group-type"
          value={type}
          onChange={(e) => setType(e.target.value as 'klas' | 'community')}
          style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        >
          <option value="community">Community</option>
          <option value="klas">Klas</option>
        </select>
        <small style={{ color: '#666', fontSize: 12 }}>
          Klas: For classroom settings with students. Community: For open collaboration groups.
        </small>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="group-description" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Description (Optional)
        </label>
        <textarea
          id="group-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your group's purpose..."
          rows={3}
          style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, resize: 'vertical' }}
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? "Creating..." : "Create Group"}
      </button>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}
