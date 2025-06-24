"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { Worksheet, Folder } from '../../types/database';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AIGenerator } from '../../components/AIGenerator';

const WorksheetCard = ({ worksheet, onDelete }: { worksheet: Worksheet; onDelete: (id: string) => void; }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
          {worksheet.title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
          {worksheet.description || 'No description'}
        </p>
      </div>
      <span style={{
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '9999px',
        backgroundColor: worksheet.status === 'published' ? '#d1fae5' : '#fef3c7',
        color: worksheet.status === 'published' ? '#065f46' : '#92400e'
      }}>
        {worksheet.status}
      </span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <Link href={`/worksheets/${worksheet.id}/preview`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          backgroundColor: 'transparent',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          Preview
        </Link>
        <Link href={`/worksheets/${worksheet.id}/edit`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          Edit
        </Link>
        <button onClick={() => onDelete(worksheet.id)} style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          <Trash2 style={{ height: '1rem', width: '1rem' }} />
        </button>
    </div>
  </div>
);

export default function WorksheetsPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newWorksheet, setNewWorksheet] = useState({
    title: '',
    description: '',
    folder_id: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiWorksheetId, setAiWorksheetId] = useState<string | null>(null);
  const router = useRouter();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to view this page.');
      setLoading(false);
      return;
    }

    const { data: worksheetsData, error: worksheetsError } = await supabase
      .from('worksheets')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    const { data: foldersData, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .eq('owner_id', user.id);

    if (worksheetsError || foldersError) {
      console.error('Error fetching data:', worksheetsError || foldersError);
      setError('Failed to load your data. Please try again.');
    } else {
      setWorksheets(worksheetsData || []);
      setFolders(foldersData || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWorksheet(prev => ({ ...prev, [name]: value }));
  };

  const handleFolderChange = (value: string) => {
    setNewWorksheet(prev => ({ ...prev, folder_id: value === 'none' ? null : value }));
  };

  const handleCreateWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !newWorksheet.title) return;

    const { data, error } = await supabase
      .from('worksheets')
      .insert([{
        title: newWorksheet.title,
        description: newWorksheet.description,
        folder_id: newWorksheet.folder_id,
        owner_id: user.id,
        status: 'draft',
      }])
      .select()
      .single();

    if (error) {
      setError('Could not create the worksheet.');
      console.error(error);
    } else if (data) {
      router.push(`/worksheets/${data.id}/edit`);
    }
  };

  const handleCreateWithAI = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create a new worksheet for AI generation
    const { data, error } = await supabase
      .from('worksheets')
      .insert([{
        title: 'AI Generated Worksheet',
        description: 'Worksheet created with AI assistance',
        folder_id: null,
        owner_id: user.id,
        status: 'draft',
      }])
      .select()
      .single();

    if (error) {
      setError('Could not create the worksheet.');
      console.error(error);
    } else if (data) {
      setAiWorksheetId(data.id);
      setShowAIGenerator(true);
    }
  };

  const handleAITasksGenerated = () => {
    // Refresh worksheets list to show the updated worksheet
    fetchInitialData();
    setShowAIGenerator(false);
    setAiWorksheetId(null);
    
    // Navigate to edit page to see the generated tasks
    if (aiWorksheetId) {
      router.push(`/worksheets/${aiWorksheetId}/edit`);
    }
  };

  const handleCloseAIGenerator = () => {
    setShowAIGenerator(false);
    setAiWorksheetId(null);
  };

  const handleDeleteWorksheet = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this worksheet? This action cannot be undone.')) {
        // First, delete associated tasks
        const { error: tasksError } = await supabase.from('tasks').delete().eq('worksheet_id', id);
        if (tasksError) {
            setError('Could not delete the tasks for the worksheet.');
            console.error(tasksError);
            return;
        }

        const { error: worksheetError } = await supabase.from('worksheets').delete().eq('id', id);
        if (worksheetError) {
            setError('Could not delete the worksheet.');
            console.error(worksheetError);
        } else {
            setWorksheets(worksheets.filter(ws => ws.id !== id));
        }
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your worksheets...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ 
          maxWidth: '1280px', 
          marginLeft: 'auto', 
          marginRight: 'auto', 
          padding: '1.5rem 1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>My Worksheets</h1>
            <button
              onClick={handleCreateWithAI}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Create with AI ✨
            </button>
          </div>
        </div>
      </header>

      <main style={{ 
        maxWidth: '1280px', 
        marginLeft: 'auto', 
        marginRight: 'auto', 
        padding: '2rem 1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          marginBottom: '2rem'
        }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>
              Create New Worksheet
            </h2>
                <form onSubmit={handleCreateWorksheet} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                    <div>
                        <label htmlFor="title" style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>Title</label>
                        <input 
                          type="text" 
                          name="title" 
                          id="title" 
                          value={newWorksheet.title} 
                          onChange={handleInputChange} 
                          required 
                          placeholder="e.g. Algebra Basics"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>Description (optional)</label>
                        <textarea 
                          name="description" 
                          id="description" 
                          value={newWorksheet.description} 
                          onChange={handleInputChange} 
                          placeholder="A short summary of what this worksheet is about."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-end',
                      flexWrap: 'wrap'
                    }}>
                        <div style={{ flex: '1', minWidth: '200px' }}>
                            <label htmlFor="folder_id" style={{
                              display: 'block',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '0.5rem'
                            }}>Folder</label>
                            <select 
                              onChange={(e) => handleFolderChange(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                backgroundColor: 'white',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                cursor: 'pointer'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                              <option value="">Select a folder</option>
                              <option value="none">No folder</option>
                              {folders.map(folder => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                              ))}
                            </select>
                        </div>
                        <button type="submit" style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px 16px',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                        >
                            <PlusCircle style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                            Create & Edit Worksheet
                        </button>
                    </div>
                </form>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {worksheets.map(ws => (
            <WorksheetCard key={ws.id} worksheet={ws} onDelete={handleDeleteWorksheet} />
          ))}
        </div>
      </main>

      {showAIGenerator && aiWorksheetId && (
        <AIGenerator
          worksheetId={aiWorksheetId}
          onTasksGenerated={handleAITasksGenerated}
          onClose={handleCloseAIGenerator}
        />
      )}
    </div>
  );
}