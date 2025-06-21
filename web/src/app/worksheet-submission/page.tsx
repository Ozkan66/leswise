"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { WorksheetElement, Submission, SubmissionElement } from "../../types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function WorksheetSubmissionContent() {
  const searchParams = useSearchParams();
  const worksheetId = searchParams.get("worksheetId");
  const [elements, setElements] = useState<WorksheetElement[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [mySubmissionElements, setMySubmissionElements] = useState<SubmissionElement[]>([]);

  useEffect(() => {
    if (!worksheetId) return;
    const fetchElements = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("worksheet_elements")
        .select("id, content, max_score")
        .eq("worksheet_id", worksheetId)
        .order("position");
      if (error) {
        setError(error.message);
      } else {
        setElements(data || []);
      }
      setLoading(false);
    };
    fetchElements();
  }, [worksheetId]);

  // Fetch latest submission for this worksheet by the logged-in user
  useEffect(() => {
    if (!worksheetId) return;
    const fetchSubmission = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setMySubmission(null);
        setMySubmissionElements([]);
        return;
      }
      const { data: submission } = await supabase
        .from("submissions")
        .select("id, created_at")
        .eq("worksheet_id", worksheetId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (submission) {
        setMySubmission(submission);
        // Fetch answers, feedback, scores
        const { data: subElems } = await supabase
          .from("submission_elements")
          .select("worksheet_element_id, answer, feedback, score")
          .eq("submission_id", submission.id);
        setMySubmissionElements(subElems || []);
      } else {
        setMySubmission(null);
        setMySubmissionElements([]);
      }
      setLoading(false);
    };
    fetchSubmission();
  }, [worksheetId, submitted]);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!worksheetId) return;
    // Validatie: alle velden moeten ingevuld zijn
    const emptyFields = elements.filter(el => !answers[el.id] || answers[el.id].trim() === "");
    if (emptyFields.length > 0) {
      setError("Vul alle vragen in voordat je indient.");
      return;
    }
    try {
      // 1. Maak een submission aan
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Niet ingelogd");
      const { data: submission, error: subError } = await supabase
        .from("submissions")
        .insert({ worksheet_id: worksheetId, user_id: user.id })
        .select()
        .single();
      if (subError) throw subError;
      // 2. Per element een submission_element aanmaken
      const answerRows = elements.map((el) => ({
        submission_id: submission.id,
        worksheet_element_id: el.id,
        answer: answers[el.id] || ""
      }));
      const { error: elemError } = await supabase
        .from("submission_elements")
        .insert(answerRows);
      if (elemError) throw elemError;
      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Onbekende fout bij indienen");
    }
  };

  if (!worksheetId) return <div>Worksheet ID ontbreekt in de URL.</div>;
  if (loading) return <div>Vragen laden...</div>;

  // Student view: show submission if exists
  if (mySubmission && mySubmissionElements.length > 0) {
    // Map: elementId -> element
    const elMap: Record<string, WorksheetElement> = {};
    elements.forEach(el => { elMap[el.id] = el; });
    // Total score
    const scored = mySubmissionElements
      .map(a => {
        const score = typeof a.score === 'number' ? a.score : (a.score ? parseInt(a.score) : null);
        const max = a.worksheet_element_id ? (elMap[a.worksheet_element_id]?.max_score || 1) : 1;
        return score !== null ? { score, max } : null;
      })
      .filter(Boolean) as { score: number; max: number }[];
    const sum = scored.reduce((acc, s) => acc + (s.score || 0), 0);
    const maxSum = scored.reduce((acc, s) => acc + (s.max || 1), 0);
    return (
      <div style={{ maxWidth: 600, margin: "2rem auto" }}>
        <h2>Jouw inzending</h2>
        <div style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 18 }}>
          Totaalscore: {sum} / {maxSum} ({maxSum > 0 ? Math.round((sum / maxSum) * 100) : 0}%)
        </div>
        {elements.map(el => {
          const answerObj = mySubmissionElements.find(a => a.worksheet_element_id === el.id);
          return (
            <div key={el.id} style={{ marginBottom: 24, borderBottom: '1px solid #333', paddingBottom: 12 }}>
              <b>{JSON.parse(el.content).text}</b> <span style={{ color: '#888' }}>(max {el.max_score} punten)</span>
              <div style={{ marginLeft: 16, marginBottom: 8 }}>
                <span style={{ color: '#ccc' }}>Jouw antwoord:</span> {answerObj ? answerObj.answer : <i>Geen antwoord</i>}
              </div>
              {typeof answerObj?.score !== 'undefined' && answerObj?.score !== null && (
                <div style={{ color: '#7af' }}><b>Score:</b> {answerObj.score} / {el.max_score}</div>
              )}
              {answerObj?.feedback && (
                <div style={{ marginTop: 6, color: '#7f7' }}><b>Feedback van docent:</b> {answerObj.feedback}</div>
              )}
            </div>
          );
        })}
        <div style={{ marginTop: 32, color: '#888' }}>
          Je kunt maar één keer indienen. Neem contact op met je docent als je iets wilt aanpassen.
        </div>
      </div>
    );
  }

  if (submitted) return <div style={{color: 'green', fontWeight: 'bold', fontSize: 20, marginTop: 32}}>Je inzending is opgeslagen! Bedankt voor het invullen.<br />Herlaad deze pagina om je score/feedback te zien zodra de docent deze heeft ingevuld.</div>;

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h2>Beantwoord de vragen</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {elements.map((el) => (
          <div key={el.id} style={{ marginBottom: 24 }}>
            <label>
              <b>{JSON.parse(el.content).text}</b>
              <br />
              <input
                type="text"
                value={answers[el.id] || ""}
                onChange={(e) => handleChange(el.id, e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 8 }}
                required
              />
            </label>
          </div>
        ))}
        <button type="submit" style={{ padding: "8px 24px" }}>Indienen</button>
      </form>
    </div>
  );
}

export default function WorksheetSubmissionPage() {
  return (
    <Suspense fallback={<div>Loading worksheet...</div>}>
      <WorksheetSubmissionContent />
    </Suspense>
  );
}
