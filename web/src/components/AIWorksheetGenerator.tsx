import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface AIGenerationSettings {
  gradeLevel: string;
  subject: string;
  topic: string;
  questionTypes: {
    [key: string]: number;
  };
}

interface AIWorksheetGeneratorProps {
  worksheetId: string;
  onQuestionsGenerated?: () => void;
}

export default function AIWorksheetGenerator({ worksheetId, onQuestionsGenerated }: AIWorksheetGeneratorProps) {
  const [settings, setSettings] = useState<AIGenerationSettings>({
    gradeLevel: "",
    subject: "",
    topic: "",
    questionTypes: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const questionTypeOptions = [
    { value: "multiple_choice", label: "Meerkeuzevragen (Multiple Choice)", maxCount: 10 },
    { value: "single_choice", label: "Enkele keuze", maxCount: 10 },
    { value: "short_answer", label: "Korte antwoord", maxCount: 8 },
    { value: "essay", label: "Essay vragen", maxCount: 5 },
    { value: "matching", label: "Matching Pairs", maxCount: 6 },
    { value: "fill_gaps", label: "Gaten vullen", maxCount: 8 }
  ];

  const gradeLevelOptions = [
    "1e leerjaar basisonderwijs",
    "2e leerjaar basisonderwijs", 
    "3e leerjaar basisonderwijs",
    "4e leerjaar basisonderwijs",
    "5e leerjaar basisonderwijs",
    "6e leerjaar basisonderwijs",
    "1e leerjaar middelbaar",
    "2e leerjaar middelbaar",
    "3e leerjaar middelbaar",
    "4e leerjaar middelbaar",
    "5e leerjaar middelbaar",
    "6e leerjaar middelbaar"
  ];

  const handleQuestionTypeChange = (type: string, count: number) => {
    setSettings(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: count
      }
    }));
  };

  const handleGenerate = async () => {
    if (!settings.gradeLevel || !settings.subject || !settings.topic) {
      setError("Vul alle verplichte velden in");
      return;
    }

    const totalQuestions = Object.values(settings.questionTypes).reduce((sum, count) => sum + count, 0);
    if (totalQuestions === 0) {
      setError("Selecteer minimaal één vraagtype met aantal vragen");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get user session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Niet ingelogd. Log opnieuw in.');
      }

      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          worksheetId,
          ...settings
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Generatie mislukt');
      }

      const result = await response.json();
      
      if (result.success) {
        // Reset question types for next round
        setSettings(prev => ({ ...prev, questionTypes: {} }));
        if (onQuestionsGenerated) {
          onQuestionsGenerated();
        }
      } else {
        setError(result.message || 'Generatie mislukt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      border: '2px solid #4CAF50', 
      padding: 16, 
      borderRadius: 8, 
      backgroundColor: '#f8fff8',
      marginBottom: 24 
    }}>
      <h4 style={{ color: '#2E7D32', marginTop: 0 }}>🤖 AI Werkblad Generator</h4>
      
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: 8, 
          borderRadius: 4, 
          marginBottom: 12 
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Leerjaar *
        </label>
        <select
          value={settings.gradeLevel}
          onChange={(e) => setSettings(prev => ({ ...prev, gradeLevel: e.target.value }))}
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          required
        >
          <option value="">Selecteer leerjaar...</option>
          {gradeLevelOptions.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Vak *
        </label>
        <input
          type="text"
          value={settings.subject}
          onChange={(e) => setSettings(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Bijv. Wiskunde, Nederlands, Geschiedenis..."
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>
          Onderwerp/Topic *
        </label>
        <input
          type="text"
          value={settings.topic}
          onChange={(e) => setSettings(prev => ({ ...prev, topic: e.target.value }))}
          placeholder="Bijv. Breuken, Werkwoorden, Tweede Wereldoorlog..."
          style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
          Vraagtypes en Aantallen
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {questionTypeOptions.map(option => (
            <div key={option.value} style={{ 
              border: '1px solid #ddd', 
              padding: 12, 
              borderRadius: 6,
              backgroundColor: settings.questionTypes[option.value] > 0 ? '#e8f5e8' : 'white'
            }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: '0.9em' }}>
                {option.label}
              </label>
              <input
                type="number"
                min="0"
                max={option.maxCount}
                value={settings.questionTypes[option.value] || 0}
                onChange={(e) => handleQuestionTypeChange(option.value, parseInt(e.target.value) || 0)}
                style={{ width: '60px', padding: 4, textAlign: 'center' }}
              />
              <span style={{ marginLeft: 8, fontSize: '0.8em', color: '#666' }}>
                (max {option.maxCount})
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: 6,
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold'
        }}
      >
        {loading ? '🤖 Bezig met genereren...' : '🚀 Genereer Vragen'}
      </button>

      <div style={{ marginTop: 12, fontSize: '0.9em', color: '#666' }}>
        💡 <strong>Tip:</strong> Je kunt meerdere keren vragen genereren. Nieuwe vragen worden onder de bestaande geplaatst.
      </div>
    </div>
  );
}