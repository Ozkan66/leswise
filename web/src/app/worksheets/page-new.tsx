"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { Worksheet, Folder } from '../../types/database';
import { AIGenerator } from '../../components/AIGenerator';
import { NotificationModal } from '../../components/NotificationModal';

// --- Helper Components ---

const ActionButton = ({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href!} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
      {children}
    </Link>
  );
};

const WorksheetCard = ({ worksheet }: { worksheet: Worksheet }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-bold text-gray-800">{worksheet.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{worksheet.description || 'No description'}</p>
      </div>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${worksheet.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
        {worksheet.status}
      </span>
    </div>
    <div className="mt-6 flex justify-end items-center gap-2">
      <Link href={`/worksheets/${worksheet.id}/preview`} className="text-sm font-medium text-gray-600 hover:text-gray-900">Preview</Link>
      <Link href={`/worksheets/${worksheet.id}/edit`} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200">Edit</Link>
      <button className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600">Delete</button>
    </div>
  </div>
);


// --- Main Page Component ---

export default function WorksheetsPageNew() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newWorksheet, setNewWorksheet] = useState({
    title: '',
    description: '',
    instructions: '',
    folder_id: null,
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiWorksheetId, setAiWorksheetId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
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
    };

    fetchInitialData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewWorksheet(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('worksheets')
      .insert([{ ...newWorksheet, owner_id: user.id }])
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
        instructions: '',
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
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: worksheetsData } = await supabase
        .from('worksheets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setWorksheets(worksheetsData || []);
    };

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

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">My Worksheets</h1>
            <div className="flex items-center gap-4">
              <ActionButton onClick={handleCreateWithAI}>Create with AI ✨</ActionButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create New Worksheet Form */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Create New Worksheet</h2>
          <form onSubmit={handleCreateWorksheet} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" name="title" id="title" value={newWorksheet.title} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea name="description" id="description" value={newWorksheet.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div>
              <label htmlFor="folder_id" className="block text-sm font-medium text-gray-700 mb-1">Folder</label>
              <select name="folder_id" id="folder_id" onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="">No folder</option>
                {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" id="status" value={newWorksheet.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="draft">Draft (work in progress)</option>
                <option value="published">Published (visible to students)</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold">Create & Edit Worksheet</button>
            </div>
          </form>
        </div>

        {/* Your Worksheets List */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Your Worksheets ({worksheets.length})</h2>
          {worksheets.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {worksheets.map(ws => <WorksheetCard key={ws.id} worksheet={ws} />)}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">You haven&apos;t created any worksheets yet.</p>
              <p className="text-gray-400 text-sm mt-1">Use the form above to get started.</p>
            </div>
          )}
        </div>
      </main>

      {showAIGenerator && aiWorksheetId && (
        <AIGenerator
          worksheetId={aiWorksheetId}
          onTasksGenerated={handleAITasksGenerated}
          onClose={handleCloseAIGenerator}
          onShowNotification={showNotification}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
}
