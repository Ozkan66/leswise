import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { supabase } from "../utils/supabaseClient";
import { WorksheetElement } from "../types/database";

export default function WorksheetElementList({ worksheetId }: { worksheetId: string }) {
  const [elements, setElements] = useState<WorksheetElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<{
    text?: string;
    question?: string;
    options?: string[];
    correctAnswers?: number[];
    pairs?: Array<{left: string, right: string}>;
    correctOrder?: string[];
    textWithGaps?: string;
    [key: string]: unknown;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

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
          // Batch update all with missing max_score to 1 using a single query
          const missingIds = missing.map(el => el.id);
          await supabase
            .from("worksheet_elements")
            .update({ max_score: 1 })
            .in("id", missingIds);
          
          // Update the data in memory instead of re-fetching
          const updatedData = (data || []).map(el => 
            missingIds.includes(el.id) ? { ...el, max_score: 1 } : el
          );
          setElements(updatedData);
        } else {
          setElements(data || []);
        }
      }
      setLoading(false);
    };
    if (worksheetId) fetchElements();
  }, [worksheetId]);

  // Memoize renderElementContent to avoid recreating on each render
  const renderElementContent = useCallback((el: WorksheetElement) => {
    try {
      // Handle content as either string (old format) or object (new format)
      const content = typeof el.content === 'string' 
        ? JSON.parse(el.content) 
        : el.content;
      switch (el.type) {
        case "text":
          return <div style={{ fontStyle: 'italic' }}>{content.text}</div>;
        case "multiple_choice":
        case "single_choice":
          return (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{content.question}</div>
              {content.options?.map((option: string, index: number) => (
                <div key={index} style={{ marginLeft: 16, marginBottom: 2 }}>
                  <span style={{ 
                    color: content.correctAnswers?.includes(index) ? 'green' : 'black',
                    fontWeight: content.correctAnswers?.includes(index) ? 'bold' : 'normal'
                  }}>
                    {String.fromCharCode(65 + index)}. {option}
                    {content.correctAnswers?.includes(index) && ' ✓'}
                  </span>
                </div>
              ))}
            </div>
          );
        case "short_answer":
        case "essay":
          return <div><strong>Q:</strong> {content.question}</div>;
        case "matching":
          return (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{content.question}</div>
              <div style={{ marginLeft: 16 }}>
                {content.pairs?.map((pair: {left: string, right: string}, index: number) => (
                  <div key={index} style={{ marginBottom: 2 }}>
                    <span>{pair.left}</span> → <span>{pair.right}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        case "ordering":
          return (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{content.question}</div>
              <div style={{ marginLeft: 16 }}>
                <div style={{ fontSize: '0.9em', color: '#666' }}>Correct order:</div>
                {content.correctOrder?.map((item: string, index: number) => (
                  <div key={index} style={{ marginBottom: 2 }}>
                    {index + 1}. {item}
                  </div>
                ))}
              </div>
            </div>
          );
        case "fill_gaps":
          return (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{content.question}</div>
              <div style={{ marginLeft: 16, fontFamily: 'monospace', fontSize: '0.9em' }}>
                {content.textWithGaps?.replace(/\[gap\]/g, '___')}
              </div>
            </div>
          );
        default:
          return <div>{content.text || JSON.stringify(content)}</div>;
      }
    } catch {
      return <div style={{ color: 'red' }}>Invalid content format</div>;
    }
  }, []);

  const handleEdit = useCallback((el: WorksheetElement) => {
    setEditingId(el.id);
    try {
      // Handle content as either string (old format) or object (new format)
      const content = typeof el.content === 'string' 
        ? JSON.parse(el.content) 
        : el.content;
      setEditContent(content);
    } catch {
      // Fallback for invalid content format
      setEditContent({ text: typeof el.content === 'string' ? el.content : 'Invalid content' });
    }
  }, []);

  const handleEditSave = useCallback(async (el: WorksheetElement) => {
    if (!editContent) {
      setEditingId(null);
      return;
    }
    
    // Basic validation
    if (el.type === "text" && !editContent.text?.trim()) {
      alert("Content cannot be empty");
      return;
    }
    if ((el.type === "multiple_choice" || el.type === "single_choice" || el.type === "short_answer" || el.type === "essay" || el.type === "matching" || el.type === "ordering" || el.type === "fill_gaps") && !editContent.question?.trim()) {
      alert("Question cannot be empty");
      return;
    }
    
    await supabase
      .from("worksheet_elements")
      .update({ content: JSON.stringify(editContent) })
      .eq("id", el.id);
    setEditingId(null);
    setEditContent(null);
    // Refresh
    const { data } = await supabase
      .from("worksheet_elements")
      .select("id, type, content, position, worksheet_id, max_score, worksheets(owner_id)")
      .eq("worksheet_id", worksheetId)
      .order("position", { ascending: true });
    setElements(data || []);
  }, [editContent, worksheetId]);

  const renderEditForm = (el: WorksheetElement) => {
    if (!editContent) return null;
    
    switch (el.type) {
      case "text":
        return (
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={editContent.text || ""}
              onChange={e => setEditContent({ ...editContent, text: e.target.value })}
              style={{ width: '100%', minHeight: 60 }}
              autoFocus
            />
          </div>
        );
      case "multiple_choice":
      case "single_choice":
        return (
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Question:</label>
              <textarea
                value={editContent.question || ""}
                onChange={e => setEditContent({ ...editContent, question: e.target.value })}
                style={{ width: '100%', minHeight: 40 }}
                autoFocus
              />
            </div>
            <div>
              <label>Options:</label>
              {(editContent.options || []).map((option: string, index: number) => (
                <div key={index} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={(editContent.correctAnswers || []).includes(index)}
                    onChange={() => {
                      const correctAnswers = editContent.correctAnswers || [];
                      let newCorrectAnswers;
                      if (el.type === "single_choice") {
                        newCorrectAnswers = [index];
                      } else {
                        newCorrectAnswers = correctAnswers.includes(index) 
                          ? correctAnswers.filter((ca: number) => ca !== index)
                          : [...correctAnswers, index];
                      }
                      setEditContent({ ...editContent, correctAnswers: newCorrectAnswers });
                    }}
                    style={{ marginRight: 8 }}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={e => {
                      const newOptions = [...(editContent.options || [])];
                      newOptions[index] = e.target.value;
                      setEditContent({ ...editContent, options: newOptions });
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case "short_answer":
      case "essay":
        return (
          <div style={{ marginBottom: 8 }}>
            <label>Question:</label>
            <textarea
              value={editContent.question || ""}
              onChange={e => setEditContent({ ...editContent, question: e.target.value })}
              style={{ width: '100%', minHeight: 60 }}
              autoFocus
            />
          </div>
        );
      case "matching":
        return (
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Question:</label>
              <textarea
                value={editContent.question || ""}
                onChange={e => setEditContent({ ...editContent, question: e.target.value })}
                style={{ width: '100%', minHeight: 40 }}
                autoFocus
              />
            </div>
            <div>
              <label>Pairs:</label>
              {(editContent.pairs || []).map((pair: {left: string, right: string}, index: number) => (
                <div key={index} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="text"
                    value={pair.left}
                    onChange={e => {
                      const newPairs = [...(editContent.pairs || [])];
                      newPairs[index] = { ...newPairs[index], left: e.target.value };
                      setEditContent({ ...editContent, pairs: newPairs });
                    }}
                    style={{ flex: 1 }}
                    placeholder="Left item"
                  />
                  <span>→</span>
                  <input
                    type="text"
                    value={pair.right}
                    onChange={e => {
                      const newPairs = [...(editContent.pairs || [])];
                      newPairs[index] = { ...newPairs[index], right: e.target.value };
                      setEditContent({ ...editContent, pairs: newPairs });
                    }}
                    style={{ flex: 1 }}
                    placeholder="Right item"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case "ordering":
        return (
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Question:</label>
              <textarea
                value={editContent.question || ""}
                onChange={e => setEditContent({ ...editContent, question: e.target.value })}
                style={{ width: '100%', minHeight: 40 }}
                autoFocus
              />
            </div>
            <div>
              <label>Items (in correct order):</label>
              {(editContent.correctOrder || []).map((item: string, index: number) => (
                <div key={index} style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 8, minWidth: 20, textAlign: 'center' }}>{index + 1}.</span>
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const newOrder = [...(editContent.correctOrder || [])];
                      newOrder[index] = e.target.value;
                      setEditContent({ ...editContent, correctOrder: newOrder });
                    }}
                    style={{ flex: 1 }}
                    placeholder={`Item ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      case "fill_gaps":
        return (
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Question:</label>
              <textarea
                value={editContent.question || ""}
                onChange={e => setEditContent({ ...editContent, question: e.target.value })}
                style={{ width: '100%', minHeight: 40 }}
                autoFocus
              />
            </div>
            <div>
              <label>Text with gaps (use [gap] for gaps):</label>
              <textarea
                value={editContent.textWithGaps || ""}
                onChange={e => setEditContent({ ...editContent, textWithGaps: e.target.value })}
                style={{ width: '100%', minHeight: 60 }}
                placeholder="Enter text with [gap] markers"
              />
            </div>
          </div>
        );
      default:
        return (
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={editContent.text || ""}
              onChange={e => setEditContent({ ...editContent, text: e.target.value })}
              style={{ width: '100%', minHeight: 60 }}
              autoFocus
            />
          </div>
        );
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, elementId: string) => {
    setDragging(elementId);
    e.dataTransfer.setData('text/plain', elementId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLLIElement>, targetElementId: string) => {
    e.preventDefault();
    const draggedElementId = e.dataTransfer.getData('text/plain');
    
    if (draggedElementId === targetElementId) {
      setDragging(null);
      return;
    }

    const draggedIndex = elements.findIndex(el => el.id === draggedElementId);
    const targetIndex = elements.findIndex(el => el.id === targetElementId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDragging(null);
      return;
    }

    // Reorder elements array
    const newElements = [...elements];
    const [draggedElement] = newElements.splice(draggedIndex, 1);
    newElements.splice(targetIndex, 0, draggedElement);

    // Update positions for all affected elements
    const updatedElements = newElements.map((el, index) => ({
      ...el,
      position: index + 1
    }));

    // Optimistically update UI
    setElements(updatedElements);

    try {
      // Use RPC or batch update - for now, use upsert with all elements
      // Note: This could be further optimized with a database function
      const updatePromises = updatedElements.map(el =>
        supabase
          .from("worksheet_elements")
          .update({ position: el.position })
          .eq("id", el.id)
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error reordering elements:", error);
      alert("Failed to reorder elements. Please try again.");
      // Revert to original order on error
      setElements(elements);
    }
    
    setDragging(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
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
      .select("id, type, content, position, worksheet_id, max_score, worksheets(owner_id)")
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
      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: 8 }}>
        {isOwner ? "Drag and drop to reorder elements" : "View-only mode"}
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {elements.map((el, index) => (
          <li 
            key={el.id} 
            draggable={isOwner && editingId !== el.id}
            onDragStart={(e) => handleDragStart(e, el.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, el.id)}
            onDragEnd={handleDragEnd}
            style={{ 
              marginBottom: 16, 
              padding: 16, 
              border: '1px solid #ddd', 
              borderRadius: 4,
              backgroundColor: dragging === el.id ? '#f0f0f0' : '#f9f9f9',
              cursor: isOwner && editingId !== el.id ? 'move' : 'default',
              opacity: dragging === el.id ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '0.8em', 
                  color: '#666', 
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {isOwner && editingId !== el.id && (
                    <span style={{ marginRight: 8, fontSize: '1.2em' }}>⋮⋮</span>
                  )}
                  {index + 1}. {el.type?.replace('_', ' ')} {el.max_score && `(${el.max_score} pts)`}
                </div>
                {editingId === el.id ? (
                  <div>
                    {renderEditForm(el)}
                    <div>
                      <button 
                        style={{ marginRight: 8, padding: '4px 8px' }} 
                        onClick={() => handleEditSave(el)}
                      >
                        Save
                      </button>
                      <button 
                        style={{ padding: '4px 8px' }} 
                        onClick={() => {
                          setEditingId(null);
                          setEditContent(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  renderElementContent(el)
                )}
              </div>
              {isOwner && editingId !== el.id && (
                <div style={{ marginLeft: 16 }}>
                  <button 
                    style={{ marginRight: 8, padding: '4px 8px' }} 
                    onClick={() => handleEdit(el)}
                  >
                    Edit
                  </button>
                  <button 
                    style={{ color: 'red', padding: '4px 8px' }} 
                    onClick={() => handleDelete(el)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}