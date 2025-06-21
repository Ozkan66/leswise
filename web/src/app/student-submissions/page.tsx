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
      // Fetch all worksheets
      const { data: wsData, error: wsError } = await supabase
        .from("worksheets")
        .select("id, title, description")
        .order("created_at", { ascending: false });
      if (wsError) {
        setError(wsError.message);
        setLoading(false);
        return;
      }
      setWorksheets(wsData || []);
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

    const verbeterd = elems.some((e: { feedback?: string; score?: number }) => (e.feedback && e.feedback.trim() !== "") || (typeof e.score === "number" && e.score !== null));
    if (verbeterd) return { label: "Verbeterd", color: "#6f6", action: "view", submissionId: sub.id };
    return { label: "Ingediend (wacht op feedback)", color: "#7af", action: "view", submissionId: sub.id };
  };


  if (loading) return <div>Gegevens laden...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Mijn Werkbladen & Inzendingen</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24 }}>
        <thead>
          <tr style={{ background: "#222", color: "#fff" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Titel</th>
            <th style={{ padding: 8, textAlign: "left" }}>Status</th>
            <th style={{ padding: 8, textAlign: "left" }}>Actie</th>
          </tr>
        </thead>
        <tbody>
          {worksheets.length === 0 && (
            <tr><td colSpan={3}>Geen werkbladen gevonden.</td></tr>
          )}
          {worksheets.map(ws => {
            const status = getStatus(ws.id);
            return (
              <tr key={ws.id} style={{ borderBottom: "1px solid #444" }}>
                <td style={{ padding: 8 }}>{ws.title}</td>
                <td style={{ padding: 8 }}>
                  <span
                    style={{ color: status.color, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => router.push(`/worksheet-submission?worksheetId=${ws.id}`)}
                  >
                    {status.label}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  {status.action === "submit" ? (
                    <button style={{ color: '#f77', borderColor: '#f77' }} onClick={() => router.push(`/worksheet-submission?worksheetId=${ws.id}`)}>
                      Indienen
                    </button>
                  ) : (
                    <button style={{ color: status.color, borderColor: status.color }} onClick={() => router.push(`/worksheet-submission?worksheetId=${ws.id}`)}>
                      Bekijk inzending
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
