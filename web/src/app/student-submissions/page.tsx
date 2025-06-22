"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Worksheet, Submission } from "../../types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StudentSubmissionsPage() {
  const router = useRouter();
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setWorksheets([]);
        setSubmissions([]);
        setError("Niet ingelogd");
        setLoading(false);
        return;
      }
      // Fetch worksheets that the user has access to
      const { data: wsData, error: wsError } = await supabase
        .from("worksheets")
        .select("id, title, description, owner_id")
        .order("created_at", { ascending: false });
      if (wsError) {
        setError(wsError.message);
        setLoading(false);
        return;
      }
      
      // Filter worksheets to only include those the user has access to
      const accessibleWorksheets: Worksheet[] = [];
      for (const worksheet of wsData || []) {
        // Check if user owns the worksheet
        if (worksheet.owner_id === user.id) {
          accessibleWorksheets.push(worksheet);
          continue;
        }
        
        // Check if user has access via sharing
        const { data: hasAccess } = await supabase
          .rpc('user_has_worksheet_access', {
            p_user_id: user.id,
            p_worksheet_id: worksheet.id,
            p_required_permission: 'submit'
          });
          
        if (hasAccess) {
          accessibleWorksheets.push(worksheet);
        }
      }
      
      setWorksheets(accessibleWorksheets);
      // Fetch all submissions by this user
      const { data: subData, error: subError } = await supabase
        .from("submissions")
        .select("id, worksheet_id, created_at")
        .eq("user_id", user.id);
      if (subError) {
        setError(subError.message);
        setLoading(false);
        return;
      }
      setSubmissions(subData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helper to get submission status
  const [subDetails, setSubDetails] = useState<Record<string, Array<{ feedback?: string; score?: number }>>>({});
  useEffect(() => {
    const fetchDetails = async () => {
      // For each submission, fetch submission_elements for feedback/score
      const details: Record<string, Array<{ feedback?: string; score?: number }>> = {};
      for (const sub of submissions) {
        const { data: elems } = await supabase
          .from("submission_elements")
          .select("feedback, score")
          .eq("submission_id", sub.id);
        if (sub.worksheet_id) {
          details[sub.worksheet_id] = elems || [];
        }
      }
      setSubDetails(details);
    };
    if (submissions.length > 0) fetchDetails();
  }, [submissions]);

  const getStatus = (worksheetId: string) => {
    const sub = submissions.find((s) => s.worksheet_id === worksheetId);
    if (!sub) return { label: "Niet ingediend", color: "#f77", action: "submit" };
    
    const elems = subDetails[worksheetId] || [];
    const hasFeedback = elems.some((e: { feedback?: string; score?: number }) => e.feedback && e.feedback.trim() !== "");
    const hasScores = elems.some((e: { feedback?: string; score?: number }) => typeof e.score === "number" && e.score !== null);
    
    if (hasFeedback || hasScores) {
      // Calculate total score if available
      let scoreDisplay = "";
      if (hasScores) {
        const totalScore = elems.reduce((sum, e) => sum + (typeof e.score === "number" ? e.score : 0), 0);
        const totalQuestions = elems.length;
        scoreDisplay = ` (${totalScore}/${totalQuestions} punten)`;
      }
      
      return { 
        label: `Verbeterd${scoreDisplay}`, 
        color: "#6f6", 
        action: "view", 
        submissionId: sub.id,
        hasFeedback,
        hasScores
      };
    }
    
    return { 
      label: "Ingediend (wacht op feedback)", 
      color: "#7af", 
      action: "view", 
      submissionId: sub.id,
      hasFeedback: false,
      hasScores: false
    };
  };


  if (loading) return <div>Gegevens laden...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Mijn Toegewezen Werkbladen</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Hier zie je alle werkbladen die met jou gedeeld zijn of die je kunt maken.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr style={{ background: "#222", color: "#fff" }}>
            <th style={{ padding: 12, textAlign: "left" }}>Titel</th>
            <th style={{ padding: 12, textAlign: "left" }}>Status</th>
            <th style={{ padding: 12, textAlign: "left" }}>Feedback</th>
            <th style={{ padding: 12, textAlign: "left" }}>Actie</th>
          </tr>
        </thead>
        <tbody>
          {worksheets.length === 0 && (
            <tr><td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#666" }}>
              Geen toegewezen werkbladen gevonden. Neem contact op met je docent.
            </td></tr>
          )}
          {worksheets.map(ws => {
            const status = getStatus(ws.id);
            const elems = subDetails[ws.id] || [];
            const feedbackCount = elems.filter(e => e.feedback && e.feedback.trim() !== "").length;
            
            return (
              <tr key={ws.id} style={{ borderBottom: "1px solid #444" }}>
                <td style={{ padding: 12 }}>
                  <strong>{ws.title}</strong>
                  {ws.description && (
                    <div style={{ fontSize: "0.9em", color: "#666", marginTop: 4 }}>
                      {ws.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: 12 }}>
                  <span
                    style={{ 
                      color: status.color, 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      fontWeight: 'bold'
                    }}
                    onClick={() => router.push(`/worksheet-submission?worksheetId=${ws.id}`)}
                  >
                    {status.label}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  {status.action === 'view' && (status.hasFeedback || status.hasScores) ? (
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
                  ) : status.action === 'view' ? (
                    <span style={{ color: "#888", fontSize: "0.9em" }}>Nog geen feedback</span>
                  ) : (
                    <span style={{ color: "#666", fontSize: "0.9em" }}>-</span>
                  )}
                </td>
                <td style={{ padding: 12 }}>
                  {status.action === "submit" ? (
                    <button 
                      style={{ 
                        color: '#f77', 
                        borderColor: '#f77',
                        backgroundColor: 'transparent',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} 
                      onClick={() => router.push(`/worksheet-submission?worksheetId=${ws.id}`)}
                    >
                      Werkblad maken
                    </button>
                  ) : (
                    <button 
                      style={{ 
                        color: status.color, 
                        borderColor: status.color,
                        backgroundColor: 'transparent',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} 
                      onClick={() => router.push(`/worksheet-submission?worksheetId=${ws.id}`)}
                    >
                      {status.hasFeedback || status.hasScores ? 'Bekijk resultaten' : 'Bekijk inzending'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
