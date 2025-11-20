"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Worksheet, Submission } from "@/types/database";
import { useUserRole } from "@/hooks/useUserRole";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function StudentSubmissionsPage() {
  const router = useRouter();
  const { role, loading: roleLoading, user } = useUserRole();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subDetails, setSubDetails] = useState<Record<string, Array<{ feedback?: string; score?: number }>>>({});

  // Redirect teachers away from student submissions page
  useEffect(() => {
    if (!roleLoading && role === 'teacher') {
      router.push('/teacher-submissions');
    }
  }, [role, roleLoading, router]);

  const fetchData = useCallback(async () => {
    if (!user) {
      // Don't fetch if user is not loaded yet
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Get user's groups
      const { data: userGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .eq("status", "active");

      const groupIds = userGroups?.map(g => g.group_id) || [];

      // Step 2: Fetch worksheets shared directly with user OR with their groups
      const { data: sharedWorksheetsData, error: sharedError } = await supabase
        .from("worksheet_shares")
        .select(`
          worksheet_id,
          worksheets (
            id,
            title,
            description,
            owner_id,
            tasks (
              content
            )
          )
        `)
        .or(`shared_with_user_id.eq.${user.id},shared_with_group_id.in.(${groupIds.join(',')})`);

      if (sharedError) {
        console.error("Error fetching shared worksheets:", sharedError);
        throw new Error(`Failed to fetch worksheets: ${sharedError.message}`);
      }

      // Extract worksheets from the joined data, filtering out nulls
      // Fix: Supabase returns worksheets as an array, not a single object
      const accessibleWorksheets: Worksheet[] = (sharedWorksheetsData || [])
        .flatMap((share: { worksheets?: Worksheet[] }) => share.worksheets ?? [])
        .filter((worksheet: Worksheet | null): worksheet is Worksheet => worksheet !== null);

      setWorksheets(accessibleWorksheets);

      if (accessibleWorksheets.length > 0) {
        // Fetch submissions for the found worksheets
        const worksheetIds = accessibleWorksheets.map(w => w.id);
        const { data: submissionsData, error: submissionsError } = await supabase
          .from("submissions")
          .select("*")
          .in("worksheet_id", worksheetIds)
          .eq("user_id", user.id);

        if (submissionsError) {
          console.error("Error fetching submissions:", submissionsError);
          throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
        }
        setSubmissions(submissionsData || []);
      } else {
        setSubmissions([]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!roleLoading) {
      fetchData();
    }
  }, [roleLoading, fetchData]);

  useEffect(() => {
    if (submissions.length > 0) {
      // Build subDetails from feedback_data in submissions using reduce
      const details = submissions.reduce<Record<string, Array<{ feedback?: string; score?: number }>>>((acc, sub) => {
        if (sub.worksheet_id) {
          const feedbackData = sub.feedback_data as Record<string, { score: number; feedback: string }> || {};
          acc[sub.worksheet_id] = Object.values(feedbackData);
        }
        return acc;
      }, {});
      setSubDetails(details);
    }
  }, [submissions]);

  // Helper to get submission status
  const getSubmissionStatus = (worksheetId: string) => {
    const submission = submissions.find(s => s.worksheet_id === worksheetId);
    if (!submission) return { status: "Niet ingediend", color: "#f77", action: "submit" };

    const elems = subDetails[worksheetId] || [];
    const hasFeedback = elems.some(e => e.feedback && e.feedback.trim() !== "");
    const hasScores = elems.some(e => typeof e.score === "number");

    if (hasFeedback || hasScores || submission.status === 'graded') {
      const totalQuestions = elems.length;
      // Show number of questions graded
      const gradedCount = elems.filter(e => typeof e.score === "number").length;
      const label = hasScores
        ? `${gradedCount}/${totalQuestions} vragen beoordeeld`
        : `Verbeterd`;
      return {
        label,
        color: "#6f6",
        action: "view",
        submissionId: submission.id,
        hasFeedback,
        hasScores
      };
    }

    return {
      label: "Ingediend (wacht op feedback)",
      color: "#7af",
      action: "view",
      submissionId: submission.id,
      hasFeedback: false,
      hasScores: false
    };
  };

  if (role === 'teacher') {
    return null;
  }

  if (loading) {
    return <div>Loading student dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-4">Mijn Toegewezen Werkbladen</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'flex-start' }}>
            {worksheets.map(ws => {
              const status = getSubmissionStatus(ws.id);
              const elems = subDetails[ws.id] || [];
              const feedbackCount = elems.filter(e => e.feedback && e.feedback.trim() !== "").length;
              return (
                <div key={ws.id} style={{
                  flex: '1 1 320px',
                  minWidth: 280,
                  maxWidth: 400,
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 16,
                  background: '#fff',
                  boxShadow: '0 2px 8px #0001'
                }}>
                  <h2 className="text-xl font-semibold">{ws.title}</h2>
                  <p className="text-gray-600 mb-2">{ws.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Status: <span className="font-semibold" style={{ color: status.color }}>{status.label}</span></p>

                    {/* Show score if graded */}
                    {status.action === 'view' && status.hasScores && (() => {
                      const submission = submissions.find(s => s.worksheet_id === ws.id);
                      if (submission?.score !== undefined) {
                        const totalScore = submission.score;

                        // Calculate max score from tasks attached to the worksheet
                        // We need to cast ws to any because tasks property is not in the standard Worksheet type yet
                        // or we need to update the type. For now, let's access it safely.
                        const worksheetTasks = (ws as any).tasks || [];
                        const maxScore = worksheetTasks.reduce((sum: number, t: any) => {
                          const points = t.content?.points;
                          return sum + (typeof points === 'number' ? points : 1);
                        }, 0);

                        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
                        return (
                          <div className="mt-2 p-2 bg-blue-50 rounded">
                            <p className="font-bold text-blue-700">Score: {totalScore} / {maxScore} ({percentage}%)</p>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {status.action === 'view' && (status.hasFeedback || status.hasScores) && (
                      <div>
                        {status.hasScores && (
                          <div style={{ color: "#7af", fontSize: "0.9em" }}>
                            ✓ Beoordeeld
                          </div>
                        )}
                        {feedbackCount > 0 && (
                          <div style={{ color: "#6f6", fontSize: "0.9em" }}>
                            📝 {feedbackCount} feedback{feedbackCount !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                    {status.action === 'view' && !status.hasFeedback && !status.hasScores && (
                      <span style={{ color: "#888", fontSize: "0.9em" }}>Nog geen feedback</span>
                    )}
                    {status.action === 'submit' && (
                      <span style={{ color: "#666", fontSize: "0.9em" }}>Niet ingediend</span>
                    )}
                  </div>
                  <a
                    href={
                      status.action === 'view' && status.submissionId
                        ? `/student-submission-review/${status.submissionId}`
                        : `/worksheet-submission?worksheetId=${ws.id}`
                    }
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontWeight: 600,
                      background: status.action === 'submit' ? '#ef4444' : '#2563eb',
                      color: '#fff',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                      marginTop: 8
                    }}
                  >
                    {status.action === 'view' && (status.hasFeedback || status.hasScores) ? 'Bekijk beoordeling' : 'Werkblad maken'}
                  </a>
                </div>
              );
            })}
          </div>
          {worksheets.length === 0 && !loading && (
            <p className="text-muted-foreground">Geen toegewezen werkbladen gevonden. Vraag je docent om werkbladen met je te delen.</p>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
