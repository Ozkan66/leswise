"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { Worksheet, Folder } from '../../types/database';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AIGenerator } from '../../components/AIGenerator';
import PageLayout from '../../components/PageLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Alert from '../../components/Alert';

const WorksheetCard = ({ worksheet, onDelete }: { worksheet: Worksheet; onDelete: (id: string) => void; }) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-5">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {worksheet.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {worksheet.description || 'No description'}
        </p>
      </div>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        worksheet.status === 'published' 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      }`}>
        {worksheet.status}
      </span>
    </div>
    <div className="flex justify-end gap-2">
      <Link 
        href={`/worksheets/${worksheet.id}/preview`}
        className="inline-flex items-center justify-center px-4 py-2 bg-transparent text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Preview
      </Link>
      <Link 
        href={`/worksheets/${worksheet.id}/edit`}
        className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white border-none rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Edit
      </Link>
      <button 
        onClick={() => onDelete(worksheet.id)}
        className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white border-none rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </Card>
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
    return (
      <PageLayout maxWidth="xl">
        <div className="text-center py-8">Loading your worksheets...</div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="xl">
        <Alert variant="error">{error}</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="My Worksheets"
      maxWidth="xl"
      headerAction={
        <Button onClick={handleCreateWithAI} variant="primary">
          Create with AI ✨
        </Button>
      }
    >
      <div className="space-y-8">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Create New Worksheet
          </h2>
          <form onSubmit={handleCreateWorksheet} className="space-y-6">
            <Input
              id="title"
              name="title"
              type="text"
              label="Title"
              value={newWorksheet.title}
              onChange={handleInputChange}
              required
              placeholder="e.g. Algebra Basics"
            />

            <Textarea
              id="description"
              name="description"
              label="Description (optional)"
              value={newWorksheet.description}
              onChange={handleInputChange}
              placeholder="A short summary of what this worksheet is about."
              rows={3}
            />

            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="folder_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Folder
                </label>
                <select
                  onChange={(e) => handleFolderChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors cursor-pointer"
                >
                  <option value="">Select a folder</option>
                  <option value="none">No folder</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create & Edit Worksheet
              </Button>
            </div>
          </form>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worksheets.map(ws => (
            <WorksheetCard key={ws.id} worksheet={ws} onDelete={handleDeleteWorksheet} />
          ))}
        </div>
      </div>

      {showAIGenerator && aiWorksheetId && (
        <AIGenerator
          worksheetId={aiWorksheetId}
          onTasksGenerated={handleAITasksGenerated}
          onClose={handleCloseAIGenerator}
        />
      )}
    </PageLayout>
  );
}
