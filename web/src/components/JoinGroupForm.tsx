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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="jumper-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white uppercase tracking-wider font-mono"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Jumper codes are 6 characters long (e.g., ABC123)
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || jumperCode.length !== 6}
        className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${loading || jumperCode.length !== 6
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
            : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
      >
        {loading ? "Joining..." : "Join Group"}
      </button>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
          {success}
        </div>
      )}
    </form>
  );
}