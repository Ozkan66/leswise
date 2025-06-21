import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

type TaskType = "text" | "multiple_choice" | "single_choice" | "short_answer" | "essay";

export default function WorksheetElementCreateForm({ worksheetId, onElementCreated }: { worksheetId: string, onElementCreated?: () => void }) {
  const [taskType, setTaskType] = useState<TaskType>("text");
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [maxScore, setMaxScore] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      setCorrectAnswers(correctAnswers.filter(ca => ca !== index).map(ca => ca > index ? ca - 1 : ca));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const toggleCorrectAnswer = (index: number) => {
    if (taskType === "single_choice") {
      setCorrectAnswers([index]);
    } else if (taskType === "multiple_choice") {
      if (correctAnswers.includes(index)) {
        setCorrectAnswers(correctAnswers.filter(ca => ca !== index));
      } else {
        setCorrectAnswers([...correctAnswers, index]);
      }
    }
  };

  const resetForm = () => {
    setText("");
    setOptions(["", ""]);
    setCorrectAnswers([]);
    setMaxScore(1);
  };

  const createContent = () => {
    switch (taskType) {
      case "text":
        return { text };
      case "multiple_choice":
      case "single_choice":
        return { 
          question: text, 
          options: options.filter(opt => opt.trim()),
          correctAnswers 
        };
      case "short_answer":
      case "essay":
        return { question: text };
      default:
        return { text };
    }
  };

  const validateForm = () => {
    if (!text.trim()) {
      return "Vul de vraag/tekst in.";
    }
    if ((taskType === "multiple_choice" || taskType === "single_choice")) {
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        return "Voeg minimaal 2 antwoordopties toe.";
      }
      if (correctAnswers.length === 0) {
        return "Selecteer minimaal één correct antwoord.";
      }
    }
    if (!maxScore || isNaN(Number(maxScore)) || Number(maxScore) <= 0) {
      return "Geef een geldig puntenaantal (>0) op.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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
    const content = createContent();
    const { error: elementError } = await supabase
      .from("worksheet_elements")
      .insert([{ worksheet_id: worksheetId, type: taskType, content: JSON.stringify(content), max_score: Number(maxScore), position: nextPosition }]);
    if (elementError) {
      setError(elementError.message || "Failed to add element");
      setLoading(false);
      return;
    }
    resetForm();
    setLoading(false);
    if (onElementCreated) onElementCreated();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 16, borderRadius: 4 }}>
      <h4>Add New Task</h4>
      
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Task Type:</label>
        <select 
          value={taskType} 
          onChange={(e) => {
            setTaskType(e.target.value as TaskType);
            resetForm();
          }}
          style={{ marginRight: 8, padding: 4 }}
        >
          <option value="text">Text/Information</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="single_choice">Single Choice</option>
          <option value="short_answer">Short Answer</option>
          <option value="essay">Essay</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          {taskType === "text" ? "Content:" : "Question:"}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={taskType === "text" ? "Enter content/instructions..." : "Enter your question..."}
          required
          style={{ width: '100%', minHeight: 60, padding: 4 }}
        />
      </div>

      {(taskType === "multiple_choice" || taskType === "single_choice") && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Answer Options:</label>
          {options.map((option, index) => (
            <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={correctAnswers.includes(index)}
                onChange={() => toggleCorrectAnswer(index)}
                style={{ marginRight: 8 }}
                title={taskType === "single_choice" ? "Correct answer" : "Check if correct"}
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                style={{ flex: 1, marginRight: 8, padding: 4 }}
              />
              {options.length > 2 && (
                <button 
                  type="button" 
                  onClick={() => removeOption(index)}
                  style={{ color: 'red', padding: '4px 8px' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={addOption}
            style={{ marginTop: 8, padding: '4px 8px' }}
          >
            Add Option
          </button>
          <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
            {taskType === "single_choice" ? "Select one correct answer" : "Select all correct answers"}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Max Score:</label>
        <input
          type="number"
          min={1}
          value={maxScore}
          onChange={e => setMaxScore(Number(e.target.value))}
          required
          style={{ width: 80, padding: 4 }}
          placeholder="Points"
        />
      </div>

      <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
        {loading ? "Adding..." : "Add Task"}
      </button>
      
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </form>
  );
}
