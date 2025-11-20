import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { WorksheetShare, AnonymousLink, AnonymousSubmission } from "../types/database";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Trash2, Copy, Users, User as UserIcon, Ban } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface GroupProgress {
  groupId: string;
  worksheetId: string;
  submittedCount: number;
  totalMembers: number;
}

export default function SharedWorksheetsManager() {
  const [shares, setShares] = useState<WorksheetShare[]>([]);
  const [anonymousLinks, setAnonymousLinks] = useState<AnonymousLink[]>([]);
  const [groupProgress, setGroupProgress] = useState<GroupProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setError('Je moet ingelogd zijn om gedeelde werkbladen te bekijken');
        setLoading(false);
        return;
      }

      // 1. Fetch worksheet shares with joins
      const { data: sharesData, error: sharesError } = await supabase
        .from('worksheet_shares')
        .select(`
          *,
          worksheets(id, title),
          shared_with_user:user_profiles!worksheet_shares_shared_with_user_id_fkey(email, first_name, last_name),
          shared_with_group:groups(id, name)
        `)
        .eq('shared_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (sharesError) throw sharesError;

      // 2. Fetch anonymous links
      const { data: linksData, error: linksError } = await supabase
        .from('anonymous_links')
        .select(`
          *,
          worksheets(id, title)
        `)
        .eq('created_by_user_id', user.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      // 3. Calculate Group Progress
      // Filter shares that are for groups
      const groupShares = sharesData?.filter(s => s.shared_with_group_id) || [];

      if (groupShares.length > 0) {
        const groupIds = groupShares.map(s => s.shared_with_group_id);
        const worksheetIds = groupShares.map(s => s.worksheet_id);

        // Fetch group members count
        const { data: membersData } = await supabase
          .from('group_members')
          .select('group_id, user_id')
          .in('group_id', groupIds)
          .eq('status', 'active');

        // Fetch submissions for these worksheets
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('worksheet_id, user_id')
          .in('worksheet_id', worksheetIds);

        // Calculate progress per share
        const progress: GroupProgress[] = groupShares.map(share => {
          const groupId = share.shared_with_group_id!;
          const worksheetId = share.worksheet_id;

          // Get members of this group
          const groupMembers = membersData?.filter(m => m.group_id === groupId).map(m => m.user_id) || [];
          const totalMembers = groupMembers.length;

          // Count how many of these members have submitted
          const submittedCount = submissionsData?.filter(sub =>
            sub.worksheet_id === worksheetId && groupMembers.includes(sub.user_id)
          ).length || 0;

          return {
            groupId,
            worksheetId,
            submittedCount,
            totalMembers
          };
        });

        setGroupProgress(progress);
      }

      // Update state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setShares(sharesData as any || []);
      setAnonymousLinks(linksData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Kon gegevens niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    if (confirmingDelete !== shareId) {
      setConfirmingDelete(shareId);
      toast.warning('Klik nogmaals om te bevestigen');
      setTimeout(() => setConfirmingDelete(null), 3000);
      return;
    }

    try {
      const { error } = await supabase.from('worksheet_shares').delete().eq('id', shareId);
      if (error) throw error;
      toast.success('Toegang ingetrokken');
      setConfirmingDelete(null);
      fetchData();
    } catch (err) {
      toast.error('Kon toegang niet intrekken');
    }
  };

  const handleDeactivateLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('anonymous_links')
        .update({ is_active: false })
        .eq('id', linkId);
      if (error) throw error;
      toast.success('Link gedeactiveerd');
      fetchData();
    } catch (err) {
      toast.error('Kon link niet deactiveren');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link gekopieerd naar klembord');
  };

  const getShareUrl = (linkCode: string) => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/worksheet-submission?anonymous=${linkCode}`;
  };

  const handleResetAttempts = async (shareId: string, type: 'share' | 'link') => {
    if (!window.confirm('Weet je zeker dat je het aantal pogingen wilt resetten?')) return;

    try {
      const table = type === 'share' ? 'worksheet_shares' : 'anonymous_links';
      const { error } = await supabase
        .from(table)
        .update({ attempts_used: 0 })
        .eq('id', shareId);

      if (error) throw error;
      toast.success('Pogingen gereset');
      await fetchData();
    } catch (err) {
      toast.error('Kon pogingen niet resetten');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Tabs defaultValue="shares" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="shares">Direct Gedeeld</TabsTrigger>
          <TabsTrigger value="links">Publieke Links</TabsTrigger>
        </TabsList>

        <TabsContent value="shares" className="mt-6">
          <div className="grid gap-6">
            {shares.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mb-4 opacity-20" />
                  <p>Je hebt nog geen werkbladen direct gedeeld.</p>
                </CardContent>
              </Card>
            ) : (
              shares.map((share) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const group = (share as any).shared_with_group;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const user = (share as any).shared_with_user;
                const progress = group ? groupProgress.find(p => p.groupId === group.id && p.worksheetId === share.worksheet_id) : null;

                return (
                  <Card key={share.id} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {share.worksheets?.title}
                            <Badge variant={share.permission_level === 'edit' ? 'default' : 'secondary'}>
                              {share.permission_level === 'edit' ? 'Bewerken' : 'Invullen'}
                            </Badge>
                          </h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {group ? (
                              <>
                                <Users className="h-4 w-4" />
                                <span>Groep: <strong>{group.name}</strong></span>
                              </>
                            ) : user ? (
                              <>
                                <UserIcon className="h-4 w-4" />
                                <span>Leerling: <strong>{user.first_name} {user.last_name}</strong> ({user.email})</span>
                              </>
                            ) : (
                              <span>Onbekende ontvanger</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteShare(share.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      {group && progress && (
                        <div className="mt-6 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Voortgang</span>
                            <span className="font-medium">{progress.submittedCount} van {progress.totalMembers} ingediend</span>
                          </div>
                          <Progress value={(progress.submittedCount / (progress.totalMembers || 1)) * 100} />
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>Gedeeld op {format(new Date(share.created_at || ''), 'd MMMM yyyy', { locale: nl })}</span>
                          {share.max_attempts && (
                            <div className="flex items-center gap-2">
                              <span>{share.attempts_used} / {share.max_attempts} pogingen</span>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-blue-600"
                                onClick={() => handleResetAttempts(share.id, 'share')}
                              >
                                Reset
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="links" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Werkblad</TableHead>
                  <TableHead>Link Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Gemaakt op</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anonymousLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Geen publieke links gevonden
                    </TableCell>
                  </TableRow>
                ) : (
                  anonymousLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.worksheets?.title}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {link.link_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {link.is_active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actief</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Inactief</Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(link.created_at || ''), 'd MMM yyyy', { locale: nl })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(getShareUrl(link.link_code))}
                            title="Kopieer link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          {link.is_active && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                              onClick={() => handleDeactivateLink(link.id)}
                              title="Deactiveren"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}