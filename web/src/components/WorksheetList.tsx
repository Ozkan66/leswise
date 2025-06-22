import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Worksheet } from "../types/database";
import WorksheetSharingForm from "./WorksheetSharingForm";

export default function WorksheetList({ onSelect, refresh }: { onSelect: (worksheet: Worksheet) => void, refresh?: number }) {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    instructions: string;
    status: 'draft' | 'published';
  }>({ title: '', description: '', instructions: '', status: 'draft' });
  const [userId, setUserId] = useState<string | null>(null);
  const [sharingWorksheet, setSharingWorksheet] = useState<Worksheet | null>(null);

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
        .select("id, title, description, instructions, status, folder_id, owner_id")
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

  const handleEdit = (ws: Worksheet) => {
    setEditingId(ws.id);
    setEditForm({
      title: ws.title,
      description: ws.description || '',
      instructions: ws.instructions || '',
      status: ws.status || 'draft'
    });
  };

  const handleEditSave = async (ws: Worksheet) => {
    if (!editForm.title.trim()) {
      alert("Title cannot be empty");
      return;
    }
    
    await supabase
      .from("worksheets")
      .update({ 
        title: editForm.title,
        description: editForm.description || null,
        instructions: editForm.instructions || null,
        status: editForm.status
      })
      .eq("id", ws.id);
    setEditingId(null);
    // Refresh
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setWorksheets([]);
      return;
    }
    const { data } = await supabase
      .from("worksheets")
      .select("id, title, description, instructions, status, folder_id, owner_id")
      .eq("owner_id", user.id);
    setWorksheets(data || []);
  };

  const handleDelete = async (ws: Worksheet) => {
    if (!window.confirm(`Delete worksheet '${ws.title}'? This cannot be undone.`)) return;
    await supabase.from("worksheets").delete().eq("id", ws.id);
    setWorksheets(worksheets.filter((w) => w.id !== ws.id));
  };

  if (loading) return <div>Loading worksheets...</div>;
  if (!worksheets.length) return <div>No worksheets found.</div>;

  return (
    <div>
      <h2>Your Worksheets</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {worksheets.map((ws) => (
          <li key={ws.id} style={{ 
            marginBottom: 16, 
            padding: 16, 
            border: '1px solid #ddd', 
            borderRadius: 4,
            backgroundColor: '#f9f9f9'
          }}>
            {editingId === ws.id ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Title:</label>
                  <input
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    style={{ width: '100%', padding: 4 }}
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Description:</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    style={{ width: '100%', minHeight: 60, padding: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Instructions:</label>
                  <textarea
                    value={editForm.instructions}
                    onChange={e => setEditForm({ ...editForm, instructions: e.target.value })}
                    style={{ width: '100%', minHeight: 60, padding: 4 }}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Status:</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as 'draft' | 'published' })}
                    style={{ padding: 4 }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <button 
                    onClick={() => handleEditSave(ws)}
                    style={{ marginRight: 8, padding: '4px 8px' }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    style={{ padding: '4px 8px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
                      {ws.title}
                      <span style={{ 
                        marginLeft: 8, 
                        fontSize: '0.7em', 
                        padding: '2px 6px', 
                        borderRadius: 3,
                        backgroundColor: ws.status === 'published' ? '#d4edda' : '#fff3cd',
                        color: ws.status === 'published' ? '#155724' : '#856404',
                        textTransform: 'uppercase'
                      }}>
                        {ws.status || 'draft'}
                      </span>
                    </h3>
                    {ws.description && (
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9em' }}>
                        {ws.description}
                      </p>
                    )}
                    {ws.instructions && (
                      <div style={{ margin: '0 0 8px 0', fontSize: '0.8em', color: '#888' }}>
                        <strong>Instructions:</strong> {ws.instructions.substring(0, 100)}
                        {ws.instructions.length > 100 && '...'}
                      </div>
                    )}
                  </div>
                  <div style={{ marginLeft: 16 }}>
                    <button 
                      onClick={() => onSelect(ws)}
                      style={{ marginRight: 8, padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 3 }}
                    >
                      Open
                    </button>
                    <a 
                      href={`/worksheet-submission?worksheetId=${ws.id}`} 
                      style={{ marginRight: 8, textDecoration: 'none' }}
                    >
                      <button style={{ padding: '4px 8px' }}>Submit Answers</button>
                    </a>
                    {ws.owner_id === userId && (
                      <>
                        <button 
                          onClick={() => handleEdit(ws)}
                          style={{ marginRight: 8, padding: '4px 8px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setSharingWorksheet(ws)}
                          style={{ marginRight: 8, padding: '4px 8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 3 }}
                        >
                          Share
                        </button>
                        <button 
                          onClick={() => handleDelete(ws)}
                          style={{ color: 'red', padding: '4px 8px' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      
      {sharingWorksheet && (
        <WorksheetSharingForm
          worksheetId={sharingWorksheet.id}
          worksheetTitle={sharingWorksheet.title}
          onClose={() => setSharingWorksheet(null)}
          onShared={() => {
            // Optionally refresh the worksheet list or show a success message
            console.log('Worksheet shared successfully');
          }}
        />
      )}
    </div>
  );
}
