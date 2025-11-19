"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Worksheet, Submission, SubmissionElement, Task } from "../../../types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SubmissionReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { submissionId } = params as { submissionId: string };

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [elements, setElements] = useState<Task[]>([]);
  const [answers, setAnswers] = useState<SubmissionElement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch alle data (nu als aparte functie)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const { data: submissionData, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();
    if (submissionError || !submissionData) {
      setError("Inzending niet gevonden.");
      setLoading(false);
      return;
    }
    setSubmission(submissionData);
    const { data: worksheetData, error: worksheetError } = await supabase
      .from("worksheets")
      .select("*")
      .eq("id", submissionData.worksheet_id)
      .single();
    if (worksheetError || !worksheetData) {
      setError("Werkblad niet gevonden.");
      setLoading(false);
      return;
    }
    setWorksheet(worksheetData);
    const { data: elementsData, error: elementsError } = await supabase
      .from("tasks")
      .select("*")
      .eq("worksheet_id", worksheetData.id)
      .order('order_index', { ascending: true });
    if (elementsError) {
      setError("Fout bij laden van vragen.");
      setLoading(false);
      return;
    }
    setElements(elementsData || []);
    const { data: answersData, error: answersError } = await supabase
      .from("submission_elements")
      .select("*")
      .eq("submission_id", submissionId);
    if (answersError) {
      setError("Fout bij laden van antwoorden.");
      setLoading(false);
      return;
    }
    setAnswers(answersData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  // Auto-score functie (supports all question types)
  const calculateAutoScore = (element: Task, answer: string): number => {
    if (!element.content || answer == null) return 0;
    const content = element.content as Record<string, any>;
    const maxScore = (content.points as number) || 1;

    // Multiple Choice (multiple correct answers, answer is comma-separated indices)
    if (element.task_type === 'multiple-choice' && Array.isArray(content.correctAnswers)) {
      const correct = content.correctAnswers.map(String).sort();
      const given = (answer || '').split(',').map((s: string) => s.trim()).filter(Boolean).sort();
      if (correct.length === given.length && correct.every((v: string, i: number) => v === given[i])) {
        return maxScore;
      }
      return 0;
    }

    // Single Choice (one correct answer, answer is index as string)
    if (element.task_type === 'single-choice' && typeof content.correctAnswers?.[0] !== 'undefined') {
      return String(content.correctAnswers[0]) === String(answer) ? maxScore : 0;
    }

    // Short Answer (case-insensitive, trims)
    if (element.task_type === 'short-answer' && typeof content.correctAnswer === 'string') {
      return content.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase() ? maxScore : 0;
    }

    // Essay: altijd handmatig beoordelen
    if (element.task_type === 'essay') {
      return 0;
    }

    // Matching (answer is JSON.stringify(array of selected right values))
    if (element.task_type === 'matching' && Array.isArray(content.pairs)) {
      try {
        const given = JSON.parse(answer);
        const correct = content.pairs.map((p: { right: string }) => p.right);
        if (Array.isArray(given) && given.length === correct.length && given.every((val: string, i: number) => val === correct[i])) {
          return maxScore;
        }
      } catch { }
      return 0;
    }

    // Ordering (answer is JSON.stringify(array of user order))
    if (element.task_type === 'ordering' && Array.isArray(content.correctOrder)) {
      try {
        const given = JSON.parse(answer);
        if (Array.isArray(given) && given.length === content.correctOrder.length && given.every((val: string, i: number) => val === content.correctOrder[i])) {
          return maxScore;
        }
      } catch { }
      return 0;
    }

    // Fill the Gaps (answer is JSON.stringify(array of gap answers))
    if (element.task_type === 'fill-gaps' && Array.isArray(content.gapAnswers)) {
      try {
        const given = JSON.parse(answer);
        if (Array.isArray(given) && given.length === content.gapAnswers.length && given.every((val: string, i: number) => val.trim().toLowerCase() === String(content.gapAnswers[i]).trim().toLowerCase())) {
          return maxScore;
        }
      } catch { }
      return 0;
    }

    // Text/information: geen score
    if (element.task_type === 'text' || element.task_type === 'information') {
      return 0;
    }

    // Fallback: probeer op string match correctAnswer
    if (typeof content.correctAnswer === 'string') {
      return content.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase() ? maxScore : 0;
    }

    return 0;
  };

  // Auto-score alle antwoorden
  const handleAutoScore = () => {
    const updatedAnswers = answers.map(answer => {
      if (answer.answer) {
        const element = elements.find(el => el.id === answer.worksheet_element_id);
        if (element) {
          const autoScore = calculateAutoScore(element, answer.answer);
          return { ...answer, score: autoScore };
        }
      }
      return answer;
    });
    setAnswers(updatedAnswers);
    alert('Auto-score toegepast op alle antwoorden!');
  };

  // Opslaan in database
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const answer of answers) {
        const { error: ansError } = await supabase
          .from("submission_elements")
          .update({ feedback: answer.feedback || "", score: answer.score || 0 })
          .eq("submission_id", submissionId)
          .eq("worksheet_element_id", answer.worksheet_element_id);
        if (ansError) {
          // Debug: log en alert error
          console.error('Supabase update error:', ansError);
          alert('Supabase update error: ' + ansError.message);
          throw ansError;
        }
      }
      // Update submission met totaalscore
      const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
      await supabase
        .from("submissions")
        .update({ feedback: "Beoordeeld door docent", score: totalScore })
        .eq("id", submissionId);
      alert("✅ Beoordeling opgeslagen in database!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onbekende fout bij opslaan");
    }
    setSaving(false);
  };

  // Verstuur naar student (opslaan + status update)
  const handleSend = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const answer of answers) {
        const { error: ansError } = await supabase
          .from("submission_elements")
          .update({ feedback: answer.feedback || "", score: answer.score || 0, status: 'graded' })
          .eq("submission_id", submissionId)
          .eq("worksheet_element_id", answer.worksheet_element_id);
        if (ansError) {
          console.error('Supabase update error:', ansError);
          alert('Supabase update error: ' + ansError.message);
          throw ansError;
        }
      }
      const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
      const maxScore = elements.reduce((sum, el) => sum + ((el.content?.points as number) || 1), 0);
      const { data: subData, error: subError } = await supabase
        .from("submissions")
        .update({ feedback: `Beoordeeld: ${totalScore}/${maxScore} punten`, score: totalScore, status: 'graded' })
        .eq("id", submissionId)
        .select();
      console.log('Supabase submissions update response:', subData, subError);
      if (subError) alert('Supabase submissions update error: ' + subError.message);
      alert("✅ Beoordeling verstuurd naar student!");
      router.push("/teacher-submissions");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onbekende fout bij versturen");
    }
    setSaving(false);
  };

  if (loading) return <div>Laden...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!submission || !worksheet) return null;

  // Totale score berekenen
  const elMaxScores: Record<string, number> = {};
  elements.forEach(el => {
    elMaxScores[el.id] = (el.content?.points as number) || 1;
  });
  const scored = answers
    .map(a => {
      const score = typeof a.score === "number" ? a.score : (a.score ? parseInt(a.score) : null);
      const max = a.worksheet_element_id ? (elMaxScores[a.worksheet_element_id] || 1) : 1;
      return score !== null ? { score, max } : null;
    })
    .filter(Boolean) as { score: number; max: number }[];
  const sum = scored.reduce((acc, s) => acc + (s.score || 0), 0);
  const maxSum = scored.reduce((acc, s) => acc + (s.max || 1), 0);

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", background: "#fff", borderRadius: 10, boxShadow: "0 1px 8px #0002", padding: 32 }}>
      <button onClick={() => router.push("/teacher-submissions")} style={{ marginBottom: 16 }}>
        ← Terug naar overzicht
      </button>
      <h2>Beoordeling: {worksheet.title}</h2>
      <div style={{ color: "#007acc", fontWeight: 500, marginBottom: 8 }}>
        Inzending ID: {submission.id}
      </div>
      <div style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 18 }}>
        Totale score: {sum} / {maxSum} ({maxSum > 0 ? Math.round((sum / maxSum) * 100) : 0}%)
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {elements.map((el) => {
          const answerObj = answers.find((a) => a.worksheet_element_id === el.id);
          let questionText = "Vraag niet beschikbaar";
          try {
            const contentObj = typeof el.content === "string" ? JSON.parse(el.content) : el.content;
            questionText = contentObj.question || contentObj.text || "Vraag niet beschikbaar";
          } catch {
            questionText = "Fout bij laden van vraagtekst";
          }
          return (
            <div key={el.id} style={{ borderBottom: "1px solid #eee", paddingBottom: 12 }}>
              <b>{questionText}</b>
              <div style={{ marginLeft: 16, marginBottom: 8 }}>
                <span style={{ color: "#888" }}>Antwoord:</span> {answerObj ? answerObj.answer : <i>Geen antwoord</i>}
              </div>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setError(null);
                  const answerIdx = answers.findIndex(a => a.worksheet_element_id === el.id);
                  const answerObj = answers[answerIdx];
                  // Debug: log submit
                  console.log('Form submit for element', el.id, 'submissionId', submissionId, 'feedback', answerObj?.feedback, 'score', answerObj?.score);
                  const { data: updateData, error: updateError } = await supabase
                    .from('submission_elements')
                    .update({ feedback: answerObj?.feedback || '', score: answerObj?.score ?? null })
                    .eq('submission_id', submissionId)
                    .eq('worksheet_element_id', el.id)
                    .select();
                  // Debug: log response
                  console.log('Supabase update response:', updateData, updateError);
                  if (updateError) {
                    setError(updateError.message);
                    console.error('Supabase update error:', updateError);
                    alert('Supabase update error: ' + updateError.message);
                  }
                }}
                style={{ marginTop: 8 }}
              >
                <div style={{ marginBottom: 8 }}>
                  <label>
                    Feedback:<br />
                    <textarea
                      name="feedback"
                      value={answerObj?.feedback || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setAnswers(prev => prev.map(a => a.worksheet_element_id === el.id ? { ...a, feedback: val } : a));
                      }}
                      rows={2}
                      style={{ width: '100%', padding: 6, marginTop: 4 }}
                      placeholder="Feedback voor deze vraag..."
                    />
                  </label>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label>
                    Score (0-{(el.content?.points as number) || 1}):
                    <input
                      name="score"
                      type="number"
                      min={0}
                      max={(el.content?.points as number) || 1}
                      step="0.1"
                      value={answerObj?.score !== null && answerObj?.score !== undefined ? String(answerObj.score) : ''}
                      onChange={e => {
                        const val = e.target.value;
                        setAnswers(prev => prev.map(a => a.worksheet_element_id === el.id ? { ...a, score: val === '' ? undefined : parseFloat(val) } : a));
                      }}
                      style={{ width: 100, padding: 6, marginLeft: 8, marginTop: 4 }}
                      placeholder={`Score (max ${(el.content?.points as number) || 1})`}
                    />
                    <span style={{ marginLeft: 8, color: '#888' }}>
                      /{(el.content?.points as number) || 1} punten
                    </span>
                  </label>
                </div>
                <button type="submit" style={{ padding: '4px 18px', fontSize: 14 }}>Opslaan</button>
              </form>
              {answerObj?.feedback && (
                <div style={{ marginTop: 6, color: '#7f7' }}><b>Feedback:</b> {answerObj.feedback}</div>
              )}
              {typeof answerObj?.score !== 'undefined' && answerObj?.score !== null && (
                <div style={{ color: '#7af' }}><b>Score:</b> {answerObj.score}/{(el.content?.points as number) || 1}</div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button onClick={handleAutoScore} style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={saving}>
          🤖 Auto-score
        </button>
        <button onClick={handleSave} style={{ backgroundColor: '#007acc', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={saving}>
          💾 Opslaan in Database
        </button>
        <button onClick={handleSend} style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={saving}>
          📤 Verstuur naar Student
        </button>
      </div>
      <div style={{ marginTop: 24 }}>
        <b>Opmerking docent:</b> {submission.feedback || <i>Geen feedback</i>}
      </div>
      <div style={{ marginTop: 16, color: "#888" }}>
        Ingediend op: {new Date(submission.created_at).toLocaleString()}
      </div>
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
}
