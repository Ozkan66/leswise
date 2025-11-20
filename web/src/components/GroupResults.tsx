import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, BarChart3 } from "lucide-react";

interface GroupResultsProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

interface SubmissionResult {
  user_id: string;
  worksheet_id: string;
  user_name: string;
  user_email: string;
  worksheet_title: string;
  score: number | null;
  submitted_at: string;
  status: string;
}

// Type for Supabase join result
interface SubmissionWithWorksheet {
  user_id: string;
  worksheet_id: string;
  score: number | null;
  created_at: string;
  worksheets: {
    id: string;
    title: string;
  } | null;
}

export default function GroupResults({ groupId, groupName, onClose }: GroupResultsProps) {
  const [results, setResults] = useState<SubmissionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedWorksheet, setSelectedWorksheet] = useState<string>('all');
  const [worksheets, setWorksheets] = useState<{ id: string; title: string }[]>([]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Get all group members first to filter submissions
      const { data: membersData, error: membersError } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId)
        .eq("status", "active");

      if (membersError || !membersData) {
        console.error("Error fetching members:", membersError);
        setError("Kon groepsleden niet laden");
        setLoading(false);
        return;
      }

      const userIds = membersData.map(m => m.user_id);

      if (userIds.length === 0) {
        setResults([]);
        setWorksheets([]);
        setLoading(false);
        return;
      }

      // Fetch all data in parallel using joins to reduce round trips
      const [submissionsResult, profilesResult] = await Promise.all([
        supabase
          .from("submissions")
          .select(`
            user_id,
            worksheet_id,
            score,
            created_at,
            worksheets (
              id,
              title
            )
          `)
          .in("user_id", userIds),
        supabase
          .from("user_profiles")
          .select("user_id, first_name, last_name, email")
          .in("user_id", userIds)
      ]);

      const { data: submissionsData, error: submissionsError } = submissionsResult;
      const { data: profilesData, error: profilesError } = profilesResult;

      if (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
        setError(`Kon resultaten niet laden: ${submissionsError.message}`);
        setLoading(false);
        return;
      }

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profiles if needed
      }

      if (!submissionsData || submissionsData.length === 0) {
        setResults([]);
        setWorksheets([]);
        setLoading(false);
        return;
      }

      // Create lookup map for profiles (single pass)
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Format results (single pass through submissions)
      const formattedResults: SubmissionResult[] = (submissionsData as SubmissionWithWorksheet[]).map((sub) => {
        const profile = profilesMap.get(sub.user_id);
        const worksheet = sub.worksheets;

        return {
          user_id: sub.user_id,
          worksheet_id: sub.worksheet_id,
          user_name: profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.email || 'Onbekende Gebruiker',
          user_email: profile?.email || '',
          worksheet_title: worksheet?.title || 'Onbekend Werkblad',
          score: sub.score,
          submitted_at: sub.created_at,
          status: sub.score !== null ? 'Completed' : 'Submitted'
        };
      });

      setResults(formattedResults);

      // Extract unique worksheets using reduce (single pass)
      const worksheetsMap = formattedResults.reduce((acc, r) => {
        if (!acc.has(r.worksheet_id)) {
          acc.set(r.worksheet_id, { id: r.worksheet_id, title: r.worksheet_title });
        }
        return acc;
      }, new Map<string, { id: string; title: string }>());
      
      setWorksheets(Array.from(worksheetsMap.values()));

    } catch (err) {
      setError("Er is een onverwachte fout opgetreden");
      console.error(err);
    }

    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Memoize filtered results to avoid re-filtering on every render
  const filteredResults = useMemo(() => 
    selectedWorksheet === 'all'
      ? results
      : results.filter(r => r.worksheet_id === selectedWorksheet),
    [selectedWorksheet, results]
  );

  // Memoize stats calculation to avoid recalculation on every render
  const stats = useMemo(() => {
    const totalSubmissions = filteredResults.length;
    const completedSubmissions = filteredResults.filter(r => r.score !== null).length;
    const averageScore = filteredResults
      .filter(r => r.score !== null)
      .reduce((sum, r) => sum + (r.score || 0), 0) / completedSubmissions || 0;

    return {
      totalSubmissions,
      completedSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0
    };
  }, [filteredResults]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            Resultaten voor {groupName}
          </DialogTitle>
          <DialogDescription>
            Bekijk de voortgang en scores van de groepsleden.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inzendingen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
                  <p className="text-xs text-muted-foreground">Totaal aantal</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voltooid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.completedSubmissions}</div>
                  <p className="text-xs text-muted-foreground">Nagekeken</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gem. Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{stats.averageScore}</div>
                  <p className="text-xs text-muted-foreground">Punten</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voltooiing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                  <p className="text-xs text-muted-foreground">Percentage</p>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg">
              <label className="text-sm font-medium whitespace-nowrap">Filter op Werkblad:</label>
              <Select value={selectedWorksheet} onValueChange={setSelectedWorksheet}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Selecteer een werkblad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Werkbladen</SelectItem>
                  {worksheets.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Table */}
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                Geen inzendingen gevonden voor deze selectie.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Werkblad</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Ingeleverd op</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result, index) => (
                      <TableRow key={`${result.user_id}-${result.worksheet_id}-${index}`}>
                        <TableCell>
                          <div className="font-medium">{result.user_name}</div>
                          <div className="text-xs text-muted-foreground">{result.user_email}</div>
                        </TableCell>
                        <TableCell>{result.worksheet_title}</TableCell>
                        <TableCell className="text-center">
                          {result.score !== null ? (
                            <span className={
                              result.score >= 75 ? "text-green-600 font-bold" :
                                result.score >= 50 ? "text-amber-600 font-bold" :
                                  "text-red-600 font-bold"
                            }>
                              {result.score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={result.status === 'Completed' ? 'default' : 'secondary'}
                            className={result.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                            {result.status === 'Completed' ? 'Voltooid' : 'Ingeleverd'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(result.submitted_at).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(result.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}