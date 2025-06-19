import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function WorksheetElementCreateForm({ worksheetId, onElementCreated }: { worksheetId: string, onElementCreated?: () => void }) {
  const [text, setText] = useState("");
  const [maxScore, setMaxScore] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!text.trim()) {
      setError("Vul de vraag in.");
      setLoading(false);
      return;
    }
    if (!maxScore || isNaN(Number(maxScore)) || Number(maxScore) <= 0) {
      setError("Geef een geldig puntenaantal (>0) op.");
      setLoading(false);
      return;
    }
    // Fetch current max position
    const { data: maxPosData } = await supabase
      .from("worksheet_elements")
      .select("position")
      .eq("worksheet_id", worksheetId)
      .order("position", { ascending: false })
      .limit(1);
    const nextPosition = (maxPosData && maxPosData[0]?.position ? maxPosData[0].position + 1 : 1);
    const { error: elementError } = await supabase
      .from("worksheet_elements")
      .insert([{ worksheet_id: worksheetId, type: "text", content: JSON.stringify({ text }), max_score: Number(maxScore), position: nextPosition }]);
    if (elementError) {
      setError(elementError.message || "Failed to add element");
      setLoading(false);
      return;
    }
    setText("");
    setMaxScore(1);
    setLoading(false);
    if (onElementCreated) onElementCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Element text"
        required
        style={{ marginRight: 8 }}
      />
      <input
        type="number"
        min={1}
        value={maxScore}
        onChange={e => setMaxScore(Number(e.target.value))}
        required
        style={{ width: 80, marginRight: 8 }}
        placeholder="Max score"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Element"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
