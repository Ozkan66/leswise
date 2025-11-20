import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Group } from "../types/database";
import GroupSettings from "./GroupSettings";
import GroupResults from "./GroupResults";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Users,
  Settings,
  BarChart3,
  Trash2,
  Edit3,
  Save,
  X,
  School,
  Hash,
  MoreVertical,
  Check,
  UserX,
  UserCheck,
  Shield,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface GroupMember {
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  user_profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showMembers, setShowMembers] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<{ groupId: string; groupName: string } | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }
    // Fetch groups where user is a member
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id, groups(id, name, description, type, jumper_code, created_by), role")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error || !data) {
      setGroups([]);
    } else {
      setGroups(data.map((gm: any) => ({ ...gm.groups, role: gm.role }))); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    setLoading(false);
  };

  const fetchMembers = async (groupId: string) => {
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from("group_members")
      .select(`
        user_id,
        role,
        status,
        joined_at,
        user_profiles(first_name, last_name, email)
      `)
      .eq("group_id", groupId)
      .order("joined_at", { ascending: false });

    if (error || !data) {
      setMembers([]);
      toast.error("Kon leden niet laden");
    } else {
      // Normalize user_profiles from array to single object
      const normalizedMembers = (data as any[]).map((member: any) => ({
        ...member,
        user_profiles: Array.isArray(member.user_profiles)
          ? member.user_profiles[0] || null
          : member.user_profiles
      }));
      setMembers(normalizedMembers);
    }
    setLoadingMembers(false);
  };

  const handleShowMembers = async (groupId: string) => {
    if (showMembers === groupId) {
      setShowMembers(null);
      setMembers([]);
    } else {
      setShowMembers(groupId);
      await fetchMembers(groupId);
    }
  };

  const handleShowSettings = (groupId: string) => {
    setShowSettings(groupId);
  };

  const handleCloseSettings = () => {
    setShowSettings(null);
  };

  const handleShowResults = (groupId: string, groupName: string) => {
    setShowResults({ groupId, groupName });
  };

  const handleCloseResults = () => {
    setShowResults(null);
  };

  const handleSettingsSaved = async () => {
    await fetchGroups();
  };

  const handleApproveMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from("group_members")
      .update({ status: "active" })
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (!error) {
      toast.success("Lid goedgekeurd");
      await fetchMembers(groupId);
    } else {
      toast.error("Kon lid niet goedkeuren");
    }
  };

  const handleRejectMember = async (groupId: string, userId: string) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (!error) {
      toast.success("Verzoek afgewezen");
      await fetchMembers(groupId);
    } else {
      toast.error("Kon verzoek niet afwijzen");
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    // Using toast for confirmation could be tricky, but let's stick to simple confirm for now or implement a better UI
    // For now, let's assume the user knows what they are doing or add a small confirmation step
    // Let's use a simple confirm for member removal as it's less critical than group deletion
    if (!window.confirm("Weet je zeker dat je dit lid wilt verwijderen?")) return;

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (!error) {
      toast.success("Lid verwijderd");
      await fetchMembers(groupId);
    } else {
      toast.error("Kon lid niet verwijderen");
    }
  };

  const handleEdit = (group: Group) => {
    setEditingId(group.id);
    setEditName(group.name);
  };

  const handleEditSave = async (group: Group) => {
    if (!editName.trim() || editName === group.name) {
      setEditingId(null);
      return;
    }

    const { error } = await supabase.from("groups").update({ name: editName }).eq("id", group.id);

    if (error) {
      toast.error("Kon groep niet bijwerken");
    } else {
      toast.success("Groep bijgewerkt");
      setEditingId(null);
      await fetchGroups();
    }
  };

  const handleDelete = async (groupId: string) => {
    if (confirmingDelete !== groupId) {
      setConfirmingDelete(groupId);
      toast.warning("Klik nogmaals om te bevestigen");
      setTimeout(() => setConfirmingDelete(null), 3000);
      return;
    }

    const { error } = await supabase.from("groups").delete().eq("id", groupId);

    if (error) {
      toast.error("Kon groep niet verwijderen");
    } else {
      toast.success("Groep verwijderd");
      setConfirmingDelete(null);
      await fetchGroups();
    }
  };

  const formatMemberName = (member: GroupMember) => {
    const profile = member.user_profiles;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile?.email || 'Onbekende Gebruiker';
  };

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!groups.length) return (
    <div className="text-center p-8 border border-dashed rounded-xl bg-muted/50">
      <p className="text-muted-foreground">Geen groepen gevonden. Maak een groep aan of word lid van een bestaande groep.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Jouw Groepen</h2>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {groups.map((group) => (
          <Card key={group.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  {editingId === group.id ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        autoFocus
                        className="h-8"
                      />
                      <Button size="sm" onClick={() => handleEditSave(group)} className="h-8 w-8 p-0">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {group.role === 'leader' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(group)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  <CardDescription className="text-xs line-clamp-1">{group.description || "Geen beschrijving"}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={group.type === 'klas' ? 'default' : 'secondary'} className="capitalize text-xs px-2 py-0.5 h-5">
                    {group.type === 'klas' ? <School className="mr-1 h-3 w-3" /> : <Users className="mr-1 h-3 w-3" />}
                    {group.type}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "text-xs px-2 py-0.5 h-5",
                    group.role === 'leader' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {group.role === 'leader' ? <Shield className="mr-1 h-3 w-3" /> : <User className="mr-1 h-3 w-3" />}
                    {group.role === 'leader' ? 'Leider' : 'Lid'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 px-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md w-fit">
                <span className="font-medium">Jumper Code:</span>
                <code className="bg-background px-1.5 py-0.5 rounded border font-mono text-foreground text-xs">
                  {group.jumper_code}
                </code>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 px-4 py-2 flex justify-between items-center">
              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={showMembers === group.id ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleShowMembers(group.id)}
                      >
                        <Users className="mr-2 h-3.5 w-3.5" />
                        Leden
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bekijk leden</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleShowResults(group.id, group.name)}
                      >
                        <BarChart3 className="mr-2 h-3.5 w-3.5" />
                        Resultaten
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bekijk resultaten</TooltipContent>
                  </Tooltip>

                  {group.role === 'leader' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleShowSettings(group.id)}
                        >
                          <Settings className="mr-2 h-3.5 w-3.5" />
                          Instellingen
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Groepsinstellingen</TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>

              {group.role === 'leader' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={confirmingDelete === group.id ? "destructive" : "ghost"}
                        size="sm"
                        className={cn(
                          "h-8 text-xs",
                          confirmingDelete === group.id ? "animate-pulse" : "text-destructive hover:text-destructive hover:bg-destructive/10"
                        )}
                        onClick={() => handleDelete(group.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {confirmingDelete === group.id ? "Bevestig" : ""}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Groep verwijderen</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardFooter>

            {/* Members List Expansion */}
            {showMembers === group.id && (
              <div className="border-t bg-muted/10 p-3 animate-in slide-in-from-top-2 duration-200">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Ledenlijst
                </h4>
                {loadingMembers ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    Laden...
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-muted-foreground text-xs">Geen leden gevonden.</p>
                ) : (
                  <div className="grid gap-2">
                    {members.map((member) => (
                      <div key={member.user_id} className="flex justify-between items-center p-2 bg-background rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium",
                            member.role === 'leader' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {member.user_profiles?.first_name?.[0] || member.user_profiles?.email?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-sm leading-none">{formatMemberName(member)}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>{member.role === 'leader' ? 'Leider' : 'Lid'}</span>
                              <span>•</span>
                              <span className={cn(
                                member.status === 'pending' ? "text-amber-600 font-medium" : "text-green-600"
                              )}>
                                {member.status === 'pending' ? 'Wacht' : 'Actief'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {group.role === 'leader' && (
                          <div className="flex gap-1">
                            {member.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-[10px] bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleApproveMember(group.id, member.user_id)}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Ok
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-6 px-2 text-[10px]"
                                  onClick={() => handleRejectMember(group.id, member.user_id)}
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Nee
                                </Button>
                              </>
                            )}
                            {member.status === 'active' && member.role !== 'leader' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveMember(group.id, member.user_id)}
                              >
                                <UserX className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Group Settings Modal */}
      {showSettings && (
        <GroupSettings
          groupId={showSettings}
          onClose={handleCloseSettings}
          onSave={handleSettingsSaved}
        />
      )}

      {/* Group Results Modal */}
      {showResults && (
        <GroupResults
          groupId={showResults.groupId}
          groupName={showResults.groupName}
          onClose={handleCloseResults}
        />
      )}
    </div>
  );
}

