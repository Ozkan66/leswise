"use client";

import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { WorksheetElement } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

interface AIGeneratorProps {
  worksheetId: string;
  onTasksGenerated: (tasks: WorksheetElement[]) => void;
  onClose: () => void;
}

export const AIGenerator = ({ worksheetId, onTasksGenerated, onClose }: AIGeneratorProps) => {
  const { user } = useAuth();
  const [gradeLevel, setGradeLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionTypes, setQuestionTypes] = useState({
    multiple_choice: 0,
    single_choice: 0,
    short_answer: 0,
    essay: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleQuestionTypeChange = (type: string, value: number) => {
    setQuestionTypes(prev => ({
      ...prev,
      [type]: Math.max(0, value)
    }));
  };

  const getTotalQuestions = () => {
    return Object.values(questionTypes).reduce((sum, count) => sum + count, 0);
  };

  const handleGenerate = async () => {
    if (!gradeLevel || !subject || !topic) {
      setError('Please fill in all required fields.');
      return;
    }

    if (getTotalQuestions() === 0) {
      setError('Please select at least one question type.');
      return;
    }

    if (getTotalQuestions() > 10) {
      setError('Maximum 10 questions can be generated at once.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session found. Please log in again.');
      }

      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          worksheetId,
          gradeLevel,
          subject,
          topic,
          questionTypes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to generate questions');
      }

      const result = await response.json();
      if (result.success && result.tasks) {
        onTasksGenerated(result.tasks);
        alert(`Successfully generated ${result.tasks.length} tasks!`);
        onClose();
      } else {
        throw new Error(result.message || result.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827',
            margin: 0
          }}>
            🤖 Generate Tasks with AI
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.color = '#111827'}
            onMouseOut={(e) => (e.target as HTMLElement).style.color = '#6b7280'}
          >
            ×
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Grade Level *
          </label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select grade level</option>
            <option value="Groep 1-2">Groep 1-2</option>
            <option value="Groep 3-4">Groep 3-4</option>
            <option value="Groep 5-6">Groep 5-6</option>
            <option value="Groep 7-8">Groep 7-8</option>
            <option value="Klas 1">Klas 1</option>
            <option value="Klas 2">Klas 2</option>
            <option value="Klas 3">Klas 3</option>
            <option value="Klas 4">Klas 4</option>
            <option value="Klas 5">Klas 5</option>
            <option value="Klas 6">Klas 6</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Mathematics, Dutch, History"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            Topic *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Fractions, World War II, Photosynthesis"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '0.75rem'
          }}>
            Question Types (Total: {getTotalQuestions()}/10)
          </label>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem'
          }}>
            {Object.entries(questionTypes).map(([type, count]) => (
              <div key={type} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#f9fafb'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#374151',
                  textTransform: 'capitalize'
                }}>
                  {type.replace('_', ' ')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleQuestionTypeChange(type, count - 1)}
                    disabled={count === 0}
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '2px',
                      backgroundColor: count === 0 ? '#f3f4f6' : 'white',
                      cursor: count === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    -
                  </button>
                  <span style={{
                    minWidth: '1rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuestionTypeChange(type, count + 1)}
                    disabled={getTotalQuestions() >= 10}
                    style={{
                      width: '1.5rem',
                      height: '1.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '2px',
                      backgroundColor: getTotalQuestions() >= 10 ? '#f3f4f6' : 'white',
                      cursor: getTotalQuestions() >= 10 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            disabled={isGenerating}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || getTotalQuestions() === 0}
            style={{
              padding: '0.5rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: (isGenerating || getTotalQuestions() === 0) ? '#9ca3af' : '#2563eb',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: (isGenerating || getTotalQuestions() === 0) ? 'not-allowed' : 'pointer',
              opacity: (isGenerating || getTotalQuestions() === 0) ? 0.6 : 1
            }}
          >
            {isGenerating ? 'Generating...' : `Generate ${getTotalQuestions()} Questions`}
          </button>
        </div>
      </div>
    </div>
  );
};
