import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { WorksheetElement } from "../types/database";

export default function WorksheetElementList({ worksheetId }: { worksheetId: string }) {
  const [elements, setElements] = useState<WorksheetElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchElements = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      setUserId(user?.id || null);
      const { data, error } = await supabase
        .from("worksheet_elements")
        .select("id, type, content, position, worksheet_id, max_score, worksheets(owner_id)")
        .eq("worksheet_id", worksheetId)
        .order("position", { ascending: true });
      if (error) {
        setElements([]);
      } else {
        // Check for missing max_score
        const missing = (data || []).filter(el => typeof el.max_score !== 'number' || el.max_score === null);
        if (missing.length > 0) {
          // Update all with missing max_score to 1
          await Promise.all(missing.map(el =>
            supabase.from("worksheet_elements").update({ max_score: 1 }).eq("id", el.id)
          ));
          // Fetch again
          const { data: newData } = await supabase
            .from("worksheet_elements")
            .select("id, type, content, position, worksheet_id, max_score, worksheets(owner_id)")
            .eq("worksheet_id", worksheetId)
            .order("position", { ascending: true });
          setElements(newData || []);
        } else {
          setElements(data || []);
        }
      }
      setLoading(false);
    };
    if (worksheetId) fetchElements();
  }, [worksheetId]);

  const handleEdit = (el: WorksheetElement) => {
    setEditingId(el.id);
    setEditText(el.type === "text" ? JSON.parse(el.content).text : "");
  };

  const handleEditSave = async (el: WorksheetElement) => {
    if (!editText.trim() || (el.type === "text" && editText === JSON.parse(el.content).text)) {
      setEditingId(null);
      return;
    }
    await supabase
      .from("worksheet_elements")
      .update({ content: JSON.stringify({ text: editText }) })
      .eq("id", el.id);
    setEditingId(null);
    // Refresh
    const { data } = await supabase
      .from("worksheet_elements")
      .select("id, type, content, position, worksheet_id, worksheets(owner_id)")
      .eq("worksheet_id", worksheetId)
      .order("position", { ascending: true });
    setElements(data || []);
  };

  const handleDelete = async (el: WorksheetElement) => {
    if (!window.confirm(`Delete element? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from("worksheet_elements").delete().eq("id", el.id);
    if (deleteError) {
      alert("Delete failed: " + deleteError.message);
      console.error("Supabase delete error:", deleteError);
      return;
    }
    // Refresh from backend after delete
    const { data, error } = await supabase
      .from("worksheet_elements")
      .select("id, type, content, position, worksheet_id, worksheets(owner_id)")
      .eq("worksheet_id", worksheetId)
      .order("position", { ascending: true });
    if (error) {
      alert("Fetch after delete failed: " + error.message);
      console.error("Supabase fetch error:", error);
      return;
    }
    const elements = data || [];
    // Renumber positions
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].position !== i + 1) {
        const { error: updateError } = await supabase
          .from("worksheet_elements")
          .update({ position: i + 1 })
          .eq("id", elements[i].id);
        if (updateError) {
          alert("Position update failed: " + updateError.message);
          console.error("Supabase update error:", updateError);
        }
      }
    }
    // Fetch again after all updates
    const { data: finalData, error: finalError } = await supabase
      .from("worksheet_elements")
      .select("id, type, content, position, worksheet_id, worksheets(owner_id)")
      .eq("worksheet_id", worksheetId)
      .order("position", { ascending: true });
    if (finalError) {
      alert("Final fetch failed: " + finalError.message);
      console.error("Supabase final fetch error:", finalError);
      return;
    }
    setElements(finalData || []);
  };

  if (loading) return <div>Loading worksheet elements...</div>;
  if (!elements.length) return <div>No elements found for this worksheet.</div>;

  // Assume all elements belong to the same worksheet with the same owner
  const isOwner = elements[0]?.worksheets?.owner_id === userId;

  return (
    <div>
      <h3>Worksheet Elements</h3>
      <ul>
        {elements.map((el) => (
          <li key={el.id}>
            {editingId === el.id ? (
              <>
                <input
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  autoFocus
                />
                <button style={{ marginLeft: 8 }} onClick={() => handleEditSave(el)}>Save</button>
                <button style={{ marginLeft: 8 }} onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {el.type === "text" ? JSON.parse(el.content).text : el.type}
                {isOwner && (
                  <>
                    <button style={{ marginLeft: 8 }} onClick={() => handleEdit(el)}>Edit</button>
                    <button style={{ marginLeft: 8, color: 'red' }} onClick={() => handleDelete(el)}>Delete</button>
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

