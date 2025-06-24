"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';

type TaskType = "text" | "multiple_choice" | "single_choice" | "short_answer" | "essay" | "matching" | "ordering" | "fill_gaps";

interface TaskTypeInfo {
  type: TaskType;
  label: string;
  description: string;
  icon: string;
}

const taskTypes: TaskTypeInfo[] = [
  {
    type: "text",
    label: "Text/Information",
    description: "Add instructional text, explanations, or information blocks",
    icon: "📝"
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Questions with multiple answer options (multiple correct answers allowed)",
    icon: "☑️"
  },
  {
    type: "single_choice",
    label: "Single Choice",
    description: "Questions with one correct answer from multiple options",
    icon: "🔘"
  },
  {
    type: "short_answer",
    label: "Short Answer",
    description: "Open text questions for brief responses",
    icon: "✍️"
  },
  {
    type: "essay",
    label: "Essay",
    description: "Extended text questions for detailed responses",
    icon: "📄"
  },
  {
    type: "matching",
    label: "Matching Pairs",
    description: "Match items from one column to items in another column",
    icon: "🔗"
  },
  {
    type: "ordering",
    label: "Put in Order",
    description: "Arrange items in the correct sequence",
    icon: "🔢"
  },
  {
    type: "fill_gaps",
    label: "Fill in the Gaps",
    description: "Text with blank spaces for students to complete",
    icon: "🔤"
  }
];

export default function AddTaskPage() {
  return (
    <Suspense fallback={<div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>Loading...</div>
    </div>}>
      <AddTaskPageContent />
    </Suspense>
  );
}

function AddTaskPageContent() {
  const [worksheetId, setWorksheetId] = useState<string | null>(null);
  const [worksheetTitle, setWorksheetTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const id = searchParams.get('worksheet');
    if (id) {
      setWorksheetId(id);
      fetchWorksheetDetails(id);
    } else {
      setError('No worksheet selected');
      setLoading(false);
    }
  }, [searchParams, fetchWorksheetDetails]);

  const fetchWorksheetDetails = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('worksheets')
        .select('title, owner_id')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.owner_id !== user?.id) {
        setError('You do not have permission to edit this worksheet');
        return;
      }

      setWorksheetTitle(data.title);
    } catch (err) {
      setError('Failed to load worksheet details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleTypeSelection = (type: TaskType) => {
    if (!worksheetId) return;
    
    // Navigate to task creation form with the selected type
    router.push(`/worksheets/${worksheetId}/edit?tab=add-tasks&newTask=${type}`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          maxWidth: '400px',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{error}</p>
          <Link
            href="/worksheets"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Back to Worksheets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 1.5rem' 
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              href={worksheetId ? `/worksheets/${worksheetId}/edit` : '/worksheets'}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem',
                color: '#6b7280',
                textDecoration: 'none',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              ← Back
            </Link>
            <div>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#111827',
                margin: 0
              }}>
                Add New Task
              </h1>
              {worksheetTitle && (
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.875rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  to &quot;{worksheetTitle}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Choose Task Type
          </h2>
          <p style={{ color: '#6b7280' }}>
            Select the type of task you want to add to your worksheet
          </p>
        </div>

        {/* Task Type Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {taskTypes.map((taskType) => (
            <button
              key={taskType.type}
              onClick={() => handleTypeSelection(taskType.type)}
              style={{
                display: 'block',
                width: '100%',
                padding: '1.5rem',
                backgroundColor: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLElement;
                target.style.borderColor = '#2563eb';
                target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.15)';
                target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLElement;
                target.style.borderColor = '#e5e7eb';
                target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                target.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  fontSize: '2rem',
                  flexShrink: 0
                }}>
                  {taskType.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {taskType.label}
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                    {taskType.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#0c4a6e',
            margin: '0 0 1rem 0'
          }}>
            💡 Tips for Creating Tasks
          </h3>
          <ul style={{
            color: '#164e63',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            paddingLeft: '1.5rem',
            margin: 0
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Text/Information:</strong> Use for instructions, explanations, or content blocks
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Multiple Choice:</strong> Great for knowledge checks with several possible correct answers
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Single Choice:</strong> Perfect for questions with one clear correct answer
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Short Answer:</strong> For brief responses, definitions, or calculations
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Essay:</strong> For detailed explanations, analysis, or creative writing
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Matching:</strong> Help students connect related concepts or terms
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Ordering:</strong> Test understanding of sequences, processes, or chronology
            </li>
            <li>
              <strong>Fill in the Gaps:</strong> Test specific knowledge within context
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
