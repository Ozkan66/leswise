import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function FolderCreateForm({ onFolderCreated }: { onFolderCreated?: () => void }) {
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
    const { error: folderError } = await supabase
      .from("folders")
      .insert([{ name, owner_id: user.id }]);

    if (folderError) {
      setError(folderError.message || "Failed to create folder");
      setLoading(false);
      return;
    }

    setName("");
    setLoading(false);
    if (onFolderCreated) onFolderCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Folder name"
        required
        style={{ marginRight: 8 }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Folder"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
