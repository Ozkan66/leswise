import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface JoinGroupFormProps {
  onGroupJoined?: () => void;
}

export default function JoinGroupForm({ onGroupJoined }: JoinGroupFormProps) {
  const [jumperCode, setJumperCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    try {
      // Find group by jumper code
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .select("id, name, type")
        .eq("jumper_code", jumperCode.trim().toUpperCase())
        .single();

      if (groupError || !group) {
        setError("Invalid jumper code. Please check and try again.");
        setLoading(false);
        return;
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("status")
        .eq("group_id", group.id)
        .eq("user_id", user.id)
        .single();

      if (existingMember) {
        if (existingMember.status === "active") {
          setError("You are already a member of this group.");
        } else if (existingMember.status === "pending") {
          setError("Your request to join this group is still pending approval.");
        }
        setLoading(false);
        return;
      }

      // Add user as pending member for klas groups, active for community groups
      const status = group.type === "klas" ? "pending" : "active";
      const { error: memberError } = await supabase
        .from("group_members")
        .insert([{ 
          group_id: group.id, 
          user_id: user.id, 
          role: "member", 
          status 
        }]);

      if (memberError) {
        setError("Failed to join group. Please try again.");
        setLoading(false);
        return;
      }

      if (status === "pending") {
        setSuccess(`Request sent! Your request to join "${group.name}" is pending approval from a group leader.`);
      } else {
        setSuccess(`Success! You have joined "${group.name}".`);
      }

      setJumperCode("");
      if (onGroupJoined) onGroupJoined();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h3>Join Group</h3>
      <p style={{ color: '#666', marginBottom: 12 }}>
        Enter a jumper code to join an existing group.
      </p>
      
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="jumper-code" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Jumper Code *
        </label>
        <input
          id="jumper-code"
          type="text"
          value={jumperCode}
          onChange={(e) => setJumperCode(e.target.value.toUpperCase())}
          placeholder="Enter 6-character code"
          required
          maxLength={6}
          style={{ 
            width: '100%', 
            padding: 8, 
            border: '1px solid #ccc', 
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontFamily: 'monospace'
          }}
        />
        <small style={{ color: '#666', fontSize: 12 }}>
          Jumper codes are 6 characters long (e.g., ABC123)
        </small>
      </div>

      <button 
        type="submit" 
        disabled={loading || jumperCode.length !== 6}
        style={{
          backgroundColor: (loading || jumperCode.length !== 6) ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: 4,
          cursor: (loading || jumperCode.length !== 6) ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? "Joining..." : "Join Group"}
      </button>

      {error && <div style={{ color: "red", marginTop: 8, padding: 8, backgroundColor: '#ffeaea', borderRadius: 4 }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: 8, padding: 8, backgroundColor: '#eafaf1', borderRadius: 4 }}>{success}</div>}
    </form>
  );
}