"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Worksheet, Submission } from "../../types/database";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { ChevronDown, ChevronUp, Search, FileText, Users, BarChart3, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SubmissionWithProfile extends Submission {
  user_profiles?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface WorksheetStats {
  totalSubmissions: number;
  averageScore: number;
  lastSubmissionDate: string | null;
  gradedCount: number;
}

interface WorksheetWithSubmissions extends Worksheet {
  submissions: SubmissionWithProfile[];
  stats: WorksheetStats;
}

export default function TeacherSubmissionsPage() {
  const [worksheets, setWorksheets] = useState<WorksheetWithSubmissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedWorksheet, setExpandedWorksheet] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch teacher's worksheets
      const { data: worksheetsData, error: worksheetsError } = await supabase
        .from("worksheets")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (worksheetsError) throw worksheetsError;

      if (!worksheetsData || worksheetsData.length === 0) {
        setWorksheets([]);
        setLoading(false);
        return;
      }

      const worksheetIds = worksheetsData.map(ws => ws.id);

      // 2. Fetch all submissions for these worksheets
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("submissions")
        .select(`
          *,
          user_profiles!submissions_user_id_fkey(email, first_name, last_name)
        `)
        .in("worksheet_id", worksheetIds)
        .order("submitted_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      // 3. Group submissions by worksheet and calculate stats
      const processedWorksheets = worksheetsData.map(ws => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const wsSubmissions = (submissionsData as any[])
          .filter(sub => sub.worksheet_id === ws.id)
          .map(sub => ({
            ...sub,
            user_profiles: Array.isArray(sub.user_profiles) ? sub.user_profiles[0] : sub.user_profiles
          }));

        const totalSubmissions = wsSubmissions.length;
        const gradedSubmissions = wsSubmissions.filter(s => s.status === 'graded').length;

        // Calculate average score using reduce
        const { totalScore, scoreCount } = wsSubmissions.reduce((acc, sub) => {
          if (sub.score) {
            const parts = sub.score.toString().split('/');
            if (parts.length === 2) {
              const obtained = parseFloat(parts[0]);
              const max = parseFloat(parts[1]);
              if (!isNaN(obtained) && !isNaN(max) && max > 0) {
                return {
                  totalScore: acc.totalScore + (obtained / max) * 100,
                  scoreCount: acc.scoreCount + 1
                };
              }
            }
          }
          return acc;
        }, { totalScore: 0, scoreCount: 0 });
        
        const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

        const lastSubmissionDate = wsSubmissions.length > 0 ? wsSubmissions[0].submitted_at : null;

        return {
          ...ws,
          submissions: wsSubmissions,
          stats: {
            totalSubmissions,
            averageScore,
            lastSubmissionDate,
            gradedCount: gradedSubmissions
          }
        };
      });

      setWorksheets(processedWorksheets);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorksheets = worksheets.filter(ws =>
    ws.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleWorksheet = (id: string) => {
    setExpandedWorksheet(expandedWorksheet === id ? null : id);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inzendingen & Resultaten</h1>
              <p className="text-muted-foreground mt-1">
                Bekijk en beoordeel inzendingen per werkblad.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek werkblad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {filteredWorksheets.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-1">Geen werkbladen gevonden</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Geen resultaten voor je zoekopdracht." : "Je hebt nog geen werkbladen aangemaakt."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredWorksheets.map((worksheet) => (
                <Card key={worksheet.id} className="overflow-hidden transition-all hover:shadow-md">
                  <Collapsible open={expandedWorksheet === worksheet.id} onOpenChange={() => toggleWorksheet(worksheet.id)}>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{worksheet.title}</h3>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {worksheet.stats.totalSubmissions} Inzendingen
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4" />
                              <span>Gem. Score: {worksheet.stats.averageScore}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>{worksheet.stats.gradedCount} Beoordeeld</span>
                            </div>
                            {worksheet.stats.lastSubmissionDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Laatste: {format(new Date(worksheet.stats.lastSubmissionDate), 'd MMM HH:mm', { locale: nl })}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                              {expandedWorksheet === worksheet.id ? (
                                <>Verbergen <ChevronUp className="h-4 w-4" /></>
                              ) : (
                                <>Bekijken <ChevronDown className="h-4 w-4" /></>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="border-t bg-muted/30 p-6 pt-0">
                        <div className="mt-6">
                          {worksheet.submissions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">Nog geen inzendingen voor dit werkblad.</p>
                          ) : (
                            <div className="rounded-md border bg-background">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Datum</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="text-right">Actie</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {worksheet.submissions.map((sub) => (
                                    <TableRow key={sub.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                                            {sub.user_profiles?.first_name?.[0] || sub.user_id.substring(0, 1).toUpperCase()}
                                          </div>
                                          <div>
                                            <div className="font-medium">
                                              {sub.user_profiles ? `${sub.user_profiles.first_name} ${sub.user_profiles.last_name}` : 'Onbekend'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {sub.user_profiles?.email || sub.user_id}
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {sub.submitted_at ? format(new Date(sub.submitted_at), 'd MMM yyyy HH:mm', { locale: nl }) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {sub.status === 'graded' ? (
                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Beoordeeld</Badge>
                                        ) : (
                                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Te beoordelen</Badge>
                                        )}
                                      </TableCell>
                                      <TableCell className="font-medium">
                                        {sub.score || '-'}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Link href={`/teacher-submissions/${sub.id}`}>
                                          <Button size="sm" variant={sub.status === 'graded' ? "outline" : "default"}>
                                            {sub.status === 'graded' ? 'Bekijken' : 'Beoordelen'}
                                          </Button>
                                        </Link>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
