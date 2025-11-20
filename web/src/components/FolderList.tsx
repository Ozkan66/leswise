import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Folder } from "../types/database";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Folder as FolderIcon, Edit3, Trash2, Save, X, FileText, ChevronDown, ChevronUp, Loader2, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import Link from "next/link";
import { Badge } from "./ui/badge";

export default function FolderList() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  // Expansion state
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [folderWorksheets, setFolderWorksheets] = useState<any[]>([]);
  const [loadingWorksheets, setLoadingWorksheets] = useState(false);

  const fetchFolders = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("folders")
      .select("id, name, owner_id, worksheets(count)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Kon mappen niet laden");
      setFolders([]);
    } else {
      setFolders(data || []);
    }
    setUserId(user.id);
    setLoading(false);
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleFolderClick = async (folderId: string) => {
    if (editingId) return; // Don't expand if editing

    if (expandedFolderId === folderId) {
      setExpandedFolderId(null);
      setFolderWorksheets([]);
      return;
    }

    setExpandedFolderId(folderId);
    setLoadingWorksheets(true);

    const { data, error } = await supabase
      .from('worksheets')
      .select('id, title, created_at, status')
      .eq('folder_id', folderId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Kon werkbladen niet laden');
    } else {
      setFolderWorksheets(data || []);
    }
    setLoadingWorksheets(false);
  };

  const handleEdit = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation();
    setEditingId(folder.id);
    setEditName(folder.name);
  };

  const handleEditSave = async (e?: React.MouseEvent | React.KeyboardEvent, folder?: Folder) => {
    if (e) e.stopPropagation();
    if (!folder) return;

    if (!editName.trim()) {
      toast.error("Map naam mag niet leeg zijn");
      return;
    }

    if (editName === folder.name) {
      setEditingId(null);
      return;
    }

    const { error } = await supabase
      .from("folders")
      .update({ name: editName })
      .eq("id", folder.id);

    if (error) {
      toast.error("Kon map niet bijwerken");
    } else {
      toast.success("Map bijgewerkt");
      await fetchFolders();
    }
    setEditingId(null);
  };

  const handleDelete = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (confirmingDelete !== folderId) {
      setConfirmingDelete(folderId);
      toast.warning("Klik nogmaals om te bevestigen");
      setTimeout(() => setConfirmingDelete(null), 3000);
      return;
    }

    const { error } = await supabase.from("folders").delete().eq("id", folderId);

    if (error) {
      toast.error("Kon map niet verwijderen");
    } else {
      toast.success("Map verwijderd");
      setFolders(folders.filter((f) => f.id !== folderId));
      setConfirmingDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!folders.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <FolderIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-1">Nog geen mappen</h3>
          <p className="text-sm text-muted-foreground">
            Maak je eerste map aan om je werkbladen te organiseren.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-4">Mijn Mappen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <Card
            key={folder.id}
            className={cn(
              "transition-all cursor-pointer hover:shadow-md",
              expandedFolderId === folder.id ? "ring-2 ring-primary shadow-md" : ""
            )}
            onClick={() => handleFolderClick(folder.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {editingId === folder.id ? (
                  <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(undefined, folder);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-8"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FolderIcon className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      expandedFolderId === folder.id ? "text-primary fill-primary/20" : "text-primary"
                    )} />
                    <div className="flex flex-col min-w-0">
                      <CardTitle className="text-base truncate">{folder.name}</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {folder.worksheets?.[0]?.count || 0} werkbladen
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 ml-2">
                  {editingId === folder.id ? (
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleEditSave(e, folder)}
                        className="h-8 w-8 p-0"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    folder.owner_id === userId && (
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleEdit(e, folder)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Bewerken</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleDelete(e, folder.id)}
                                className={cn(
                                  "h-8 w-8 p-0 text-muted-foreground hover:text-destructive",
                                  confirmingDelete === folder.id && "text-destructive animate-pulse bg-destructive/10"
                                )}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {confirmingDelete === folder.id ? "Klik nogmaals om te bevestigen" : "Verwijderen"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground"
                        >
                          {expandedFolderId === folder.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Expanded Content */}
            {expandedFolderId === folder.id && (
              <CardContent className="pt-0 pb-4 animate-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
                <div className="border-t pt-3 mt-1">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Inhoud
                  </h4>

                  {loadingWorksheets ? (
                    <div className="flex items-center justify-center py-4 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Laden...
                    </div>
                  ) : folderWorksheets.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2 italic">Deze map is leeg.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {folderWorksheets.map((ws) => (
                        <Link
                          key={ws.id}
                          href={`/worksheets/${ws.id}/preview`}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group transition-colors border border-transparent hover:border-border"
                        >
                          <div className="flex-1 min-w-0 mr-2">
                            <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {ws.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{ws.subject || 'Geen vak'}</span>
                              {ws.grade && <span>• {ws.grade}</span>}
                            </div>
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
