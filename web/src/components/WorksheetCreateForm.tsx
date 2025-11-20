import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Folder } from "../types/database";

interface WorksheetCreateFormProps {
  onWorksheetCreated?: () => void;
  onWorksheetCreatedWithAI?: (worksheetId: string) => void;
}

export default function WorksheetCreateForm({ onWorksheetCreated, onWorksheetCreatedWithAI }: WorksheetCreateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [folderId, setFolderId] = useState("");
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    const fetchFolders = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data } = await supabase
        .from("folders")
        .select("id, name, owner_id")
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
      .insert([{
        title,
        description: description || null,
        instructions: instructions || null,
        owner_id: user.id,
        folder_id: folderId || null,
        status: status
      }]);
    if (worksheetError) {
      setError(worksheetError.message || "Failed to create worksheet");
      setLoading(false);
      return;
    }
    setTitle("");
    setDescription("");
    setInstructions("");
    setFolderId("");
    setStatus('draft');
    setUseAI(false);
    setLoading(false);

    // Call appropriate callback based on AI selection
    if (useAI && onWorksheetCreatedWithAI) {
      // For AI mode, we'll use a simpler approach - just signal AI mode
      // The worksheet will be selected by the user for AI generation
      onWorksheetCreatedWithAI("new-worksheet");
    } else if (onWorksheetCreated) {
      onWorksheetCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24, border: '1px solid #ccc', padding: 16, borderRadius: 4 }}>
      <h4>Create New Worksheet</h4>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Worksheet title"
          required
          style={{ width: '100%', padding: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description (optional)"
          style={{ width: '100%', minHeight: 60, padding: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Instructions for Students:</label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions for students (optional)"
          style={{ width: '100%', minHeight: 60, padding: 4 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Folder:</label>
        <select
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          style={{ width: '100%', padding: 4 }}
        >
          <option value="">No folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Status:</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
          style={{ width: '100%', padding: 4 }}
        >
          <option value="draft">Draft (work in progress)</option>
          <option value="published">Published (available to students)</option>
        </select>
      </div>

      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6, border: '1px solid #ddd' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>
            🤖 AI-ondersteuning inschakelen
          </span>
        </label>
        <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4, marginLeft: 24 }}>
          Na het aanmaken krijg je de optie om vragen automatisch te laten genereren door AI
        </div>
      </div>

      <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
        {loading ? "Creating..." : "Create Worksheet"}
      </button>

      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}
