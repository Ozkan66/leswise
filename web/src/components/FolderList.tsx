import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function FolderList() {
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFolders = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setFolders([]);
        setLoading(false);
        return;
      }
      // Fetch folders where user is the owner
      const { data, error } = await supabase
        .from("folders")
        .select("id, name, owner_id")
        .eq("owner_id", user.id);

      if (error) {
        setFolders([]);
      } else {
        setFolders(data || []);
      }
      setUserId(user.id);
      setLoading(false);
    };
    fetchFolders();
  }, []);

  if (loading) return <div>Loading folders...</div>;
  if (!folders.length) return <div>No folders found.</div>;

  const handleEdit = (folder: any) => {
    setEditingId(folder.id);
    setEditName(folder.name);
  };

  const handleEditSave = async (folder: any) => {
    if (!editName.trim() || editName === folder.name) {
      setEditingId(null);
      return;
    }
    await supabase.from("folders").update({ name: editName }).eq("id", folder.id);
    setEditingId(null);
    // Refresh
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setFolders([]);
      return;
    }
    const { data } = await supabase
      .from("folders")
      .select("id, name, owner_id")
      .eq("owner_id", user.id);
    setFolders(data);
  };

  const handleDelete = async (folder: any) => {
    if (!window.confirm(`Delete folder '${folder.name}'? This cannot be undone.`)) return;
    await supabase.from("folders").delete().eq("id", folder.id);
    // Refresh
    setFolders(folders.filter((f) => f.id !== folder.id));
  };


  return (
    <div>
      <h2>Your Folders</h2>
      <ul>
        {folders.map((folder) => (
          <li key={folder.id}>
            {editingId === folder.id ? (
              <>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  autoFocus
                />
                <button style={{ marginLeft: 8 }} onClick={() => handleEditSave(folder)}>Save</button>
                <button style={{ marginLeft: 8 }} onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {folder.name}
                {folder.owner_id === userId && (
                  <>
                    <button style={{ marginLeft: 8 }} onClick={() => handleEdit(folder)}>Edit</button>
                    <button style={{ marginLeft: 8, color: 'red' }} onClick={() => handleDelete(folder)}>Delete</button>
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

