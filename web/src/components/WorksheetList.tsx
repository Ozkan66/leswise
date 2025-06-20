import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function WorksheetList({ onSelect, refresh }: { onSelect: (worksheet: any) => void, refresh?: number }) {
  const [worksheets, setWorksheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorksheets = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setWorksheets([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("worksheets")
        .select("id, title, description, folder_id, owner_id")
        .eq("owner_id", user.id);
      if (error) {
        setWorksheets([]);
      } else {
        setWorksheets(data || []);
      }
      setUserId(user.id);
      setLoading(false);
    };
    fetchWorksheets();
  }, [refresh]);

  const handleEdit = (ws: any) => {
    setEditingId(ws.id);
    setEditTitle(ws.title);
  };

  const handleEditSave = async (ws: any) => {
    if (!editTitle.trim() || editTitle === ws.title) {
      setEditingId(null);
      return;
    }
    await supabase.from("worksheets").update({ title: editTitle }).eq("id", ws.id);
    setEditingId(null);
    // Refresh
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setWorksheets([]);
      return;
    }
    const { data } = await supabase
      .from("worksheets")
      .select("id, title, description, folder_id, owner_id")
      .eq("owner_id", user.id);
    setWorksheets(data || []);
  };

  const handleDelete = async (ws: any) => {
    if (!window.confirm(`Delete worksheet '${ws.title}'? This cannot be undone.`)) return;
    await supabase.from("worksheets").delete().eq("id", ws.id);
    setWorksheets(worksheets.filter((w) => w.id !== ws.id));
  };

  if (loading) return <div>Loading worksheets...</div>;
  if (!worksheets.length) return <div>No worksheets found.</div>;

  return (
    <div>
      <h2>Your Worksheets</h2>
      <ul>
        {worksheets.map((ws) => (
          <li key={ws.id}>
            <>
              {editingId === ws.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onBlur={() => handleEditSave(ws)}
                    onKeyDown={e => e.key === 'Enter' && handleEditSave(ws)}
                    autoFocus
                  />
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <button onClick={() => onSelect(ws)}>{ws.title}</button>
              )}
              <a href={`/worksheet-submission?worksheetId=${ws.id}`} style={{ marginLeft: 8 }}>Submit Answers</a>
              {ws.owner_id === userId && (
                <>
                  <button style={{ marginLeft: 8 }} onClick={() => handleEdit(ws)}>Edit</button>
                  <button style={{ marginLeft: 8, color: 'red' }} onClick={() => handleDelete(ws)}>Delete</button>
                </>
              )}
            </>
          </li>
        ))}
      </ul>
    </div>
  );
}
