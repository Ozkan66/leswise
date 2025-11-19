"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { Worksheet, Folder } from '../../types/database';
import { PlusCircle, Trash2, FileText, Folder as FolderIcon, Sparkles } from 'lucide-react';
import { AIGenerator } from '../../components/AIGenerator';
import { NotificationModal } from '../../components/NotificationModal';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { cn } from '../../lib/utils';

const WorksheetCard = ({ worksheet, onDelete }: { worksheet: Worksheet; onDelete: (id: string) => void; }) => (
  <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-5">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {worksheet.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {worksheet.description || 'Geen beschrijving'}
        </p>
      </div>
      <span className={cn(
        "px-3 py-1 text-xs font-semibold rounded-full",
        worksheet.status === 'published'
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      )}>
        {worksheet.status === 'published' ? 'Gepubliceerd' : 'Concept'}
      </span>
    </div>
    <div className="flex justify-end gap-2">
      <Link
        href={`/worksheets/${worksheet.id}/preview`}
        className="inline-flex items-center justify-center px-4 py-2 bg-transparent text-foreground border border-input rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Preview
      </Link>
      <Link
        href={`/worksheets/${worksheet.id}/edit`}
        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Bewerken
      </Link>
      <button
        onClick={() => onDelete(worksheet.id)}
        className="inline-flex items-center justify-center px-3 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
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
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const router = useRouter();

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Je moet ingelogd zijn om deze pagina te bekijken.');
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
      setError('Kon gegevens niet laden. Probeer het opnieuw.');
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
      setError('Kon werkblad niet aanmaken.');
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
        title: 'AI Gegenereerd Werkblad',
        description: 'Werkblad gemaakt met AI assistentie',
        folder_id: null,
        owner_id: user.id,
        status: 'draft',
      }])
      .select()
      .single();

    if (error) {
      setError('Kon werkblad niet aanmaken.');
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

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  const handleDeleteWorksheet = async (id: string) => {
    if (window.confirm('Weet je zeker dat je dit werkblad wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      // First, delete associated tasks
      const { error: tasksError } = await supabase.from('tasks').delete().eq('worksheet_id', id);
      if (tasksError) {
        setError('Kon taken van werkblad niet verwijderen.');
        console.error(tasksError);
        return;
      }

      const { error: worksheetError } = await supabase.from('worksheets').delete().eq('id', id);
      if (worksheetError) {
        setError('Kon werkblad niet verwijderen.');
        console.error(worksheetError);
      } else {
        setWorksheets(worksheets.filter(ws => ws.id !== id));
      }
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="p-8 text-center text-destructive">{error}</div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Mijn Werkbladen</h1>
              <p className="text-muted-foreground">Beheer en maak nieuwe werkbladen voor je klassen.</p>
            </div>
            <button
              onClick={handleCreateWithAI}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Maak met AI ✨
            </button>
          </header>

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Nieuw Werkblad Maken
            </h2>
            <form onSubmit={handleCreateWorksheet} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">Titel</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newWorksheet.title}
                  onChange={handleInputChange}
                  required
                  placeholder="bijv. Algebra Basis"
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">Beschrijving (optioneel)</label>
                <textarea
                  name="description"
                  id="description"
                  value={newWorksheet.description}
                  onChange={handleInputChange}
                  placeholder="Een korte samenvatting van waar dit werkblad over gaat."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y"
                />
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="folder_id" className="block text-sm font-medium text-foreground mb-2">Map</label>
                  <select
                    onChange={(e) => handleFolderChange(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  >
                    <option value="">Selecteer een map</option>
                    <option value="none">Geen map</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap h-[38px]"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Werkblad Maken & Bewerken
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worksheets.map(ws => (
              <WorksheetCard key={ws.id} worksheet={ws} onDelete={handleDeleteWorksheet} />
            ))}
          </div>

          {worksheets.length === 0 && !loading && (
            <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-1">Nog geen werkbladen</h3>
              <p className="text-muted-foreground">Maak je eerste werkblad hierboven aan of gebruik de AI generator.</p>
            </div>
          )}
        </div>

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
    </AuthenticatedLayout>
  );
}