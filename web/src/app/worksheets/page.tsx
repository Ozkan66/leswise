"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { Worksheet, Folder } from '../../types/database';
import { PlusCircle, Trash2, FileText, Folder as FolderIcon, Sparkles, Share2, Eye, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { AIGenerator } from '../../components/AIGenerator';
import { NotificationModal } from '../../components/NotificationModal';
import AuthenticatedLayout from '../../components/AuthenticatedLayout';
import { cn } from '../../lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import WorksheetSharingForm from '../../components/WorksheetSharingForm';

const WorksheetCard = ({
  worksheet,
  onDelete,
  onShare,
  confirmingDelete,
  folders,
  onFolderChange
}: {
  worksheet: Worksheet;
  onDelete: (id: string) => void;
  onShare: (worksheet: Worksheet) => void;
  confirmingDelete: string | null;
  folders: Folder[];
  onFolderChange: (worksheetId: string, folderId: string | null) => void;
}) => {
  const currentFolder = folders.find(f => f.id === worksheet.folder_id);

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
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
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        )}>
          {worksheet.status === 'published' ? 'Gepubliceerd' : 'Concept'}
        </span>
      </div>

      {/* Folder selector */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <FolderIcon className="h-4 w-4 text-muted-foreground" />
          <Select
            value={worksheet.folder_id || "none"}
            onValueChange={(value) => onFolderChange(worksheet.id, value === "none" ? null : value)}
          >
            <SelectTrigger className="h-8 w-[200px] text-sm">
              <SelectValue placeholder="Geen map" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Geen map</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TooltipProvider>
        <div className="flex justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/worksheets/${worksheet.id}/preview`}
                className="inline-flex items-center justify-center h-9 w-9 bg-transparent text-foreground border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Preview</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onShare(worksheet)}
                className="inline-flex items-center justify-center h-9 w-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Delen</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/worksheets/${worksheet.id}/edit`}
                className="inline-flex items-center justify-center h-9 w-9 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Bewerken</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onDelete(worksheet.id)}
                className={cn(
                  "inline-flex items-center justify-center h-9 w-9 rounded-md transition-colors",
                  confirmingDelete === worksheet.id
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {confirmingDelete === worksheet.id ? 'Klik nogmaals om te bevestigen' : 'Verwijderen'}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};

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
  const [sharingWorksheet, setSharingWorksheet] = useState<Worksheet | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
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

  const handleNewWorksheetFolderChange = (value: string) => {
    setNewWorksheet(prev => ({ ...prev, folder_id: value === 'none' ? null : value }));
  };

  const handleCreateWorksheet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('worksheets')
      .insert([{
        title: 'Nieuw Werkblad',
        description: '',
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
    if (confirmingDelete !== id) {
      setConfirmingDelete(id);
      toast.warning('Klik nogmaals om te bevestigen');
      setTimeout(() => setConfirmingDelete(null), 3000);
      return;
    }

    try {
      // First, delete associated tasks
      const { error: tasksError } = await supabase.from('tasks').delete().eq('worksheet_id', id);
      if (tasksError) {
        toast.error('Kon taken van werkblad niet verwijderen.');
        console.error(tasksError);
        return;
      }

      const { error: worksheetError } = await supabase.from('worksheets').delete().eq('id', id);
      if (worksheetError) {
        toast.error('Kon werkblad niet verwijderen.');
        console.error(worksheetError);
      } else {
        setWorksheets(worksheets.filter(ws => ws.id !== id));
        toast.success('Werkblad verwijderd');
        setConfirmingDelete(null);
      }
    } catch (err) {
      toast.error('Er is een fout opgetreden');
      console.error(err);
    }
  };

  const handleFolderChange = async (worksheetId: string, folderId: string | null) => {
    try {
      const { error } = await supabase
        .from('worksheets')
        .update({ folder_id: folderId })
        .eq('id', worksheetId);

      if (error) {
        toast.error('Kon map niet wijzigen');
      } else {
        toast.success('Map bijgewerkt');
        // Update local state
        setWorksheets(worksheets.map(ws =>
          ws.id === worksheetId ? { ...ws, folder_id: folderId } : ws
        ));
      }
    } catch (err) {
      toast.error('Er is een fout opgetreden');
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Nieuw Werkblad Maken
                </h2>
                <p className="text-sm text-muted-foreground">
                  Maak direct een nieuw werkblad aan. Je kunt de titel en instellingen later aanpassen.
                </p>
              </div>
              <button
                onClick={handleCreateWorksheet}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Nieuw Werkblad
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worksheets.map(worksheet => (
              <WorksheetCard
                key={worksheet.id}
                worksheet={worksheet}
                onDelete={handleDeleteWorksheet}
                onShare={(ws) => setSharingWorksheet(ws)}
                confirmingDelete={confirmingDelete}
                folders={folders}
                onFolderChange={handleFolderChange}
              />
            ))}
          </div>


          <Dialog open={!!sharingWorksheet} onOpenChange={(open) => !open && setSharingWorksheet(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Werkblad Delen</DialogTitle>
              </DialogHeader>
              {sharingWorksheet && (
                <WorksheetSharingForm
                  worksheetId={sharingWorksheet.id}
                  worksheetTitle={sharingWorksheet.title}
                  onClose={() => setSharingWorksheet(null)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* AI Generator Modal */}
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
    </AuthenticatedLayout >
  );
}