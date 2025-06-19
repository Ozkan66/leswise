import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function WorksheetCreateForm({ onWorksheetCreated }: { onWorksheetCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("");
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFolders = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data } = await supabase
        .from("folders")
        .select("id, name")
        .eq("owner_id", user.id);
      setFolders(data || []);
    };
    fetchFolders();
  }, []);

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
    const { error: worksheetError } = await supabase
      .from("worksheets")
      .insert([{ title, description, owner_id: user.id, folder_id: folderId || null }]);
    if (worksheetError) {
      setError(worksheetError.message || "Failed to create worksheet");
      setLoading(false);
      return;
    }
    setTitle("");
    setDescription("");
    setFolderId("");
    setLoading(false);
    if (onWorksheetCreated) onWorksheetCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Worksheet title"
        required
        style={{ marginRight: 8 }}
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={{ marginRight: 8 }}
      />
      <select value={folderId} onChange={(e) => setFolderId(e.target.value)} style={{ marginRight: 8 }}>
        <option value="">No folder</option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>{folder.name}</option>
        ))}
      </select>
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Worksheet"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
