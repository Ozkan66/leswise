import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function GroupCreateForm({ onGroupCreated }: { onGroupCreated?: () => void }) {
  const [name, setName] = useState("");
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
      .insert([{ name, owner_id: user.id, jumper_code }])
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
    setLoading(false);
    if (onGroupCreated) onGroupCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Group name"
        required
        style={{ marginRight: 8 }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Group"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
