"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Worksheet, Submission, SubmissionElement, Task } from "../../../types/database";
import AuthenticatedLayout from "../../../components/AuthenticatedLayout";

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

    // Load answers from the JSON field in submissions table
    const answersJson = submissionData.answers as Record<string, any> || {};

    // Convert JSON answers to submission_elements format for compatibility
    const convertedAnswers: SubmissionElement[] = (elementsData || []).map(task => {
      const answer = answersJson[task.id];
      let answerString = '';

      if (answer !== undefined && answer !== null) {
        if (typeof answer === 'object') {
          answerString = JSON.stringify(answer);
        } else if (Array.isArray(answer)) {
          answerString = answer.join(',');
        } else {
          answerString = String(answer);
        }
      }

      return {
        id: `temp-${task.id}`,
        submission_id: submissionId,
        worksheet_element_id: task.id,
        answer: answerString,
        score: 0,
        feedback: '',
        status: 'submitted',
        created_at: submissionData.created_at
      } as SubmissionElement;
    });

    setAnswers(convertedAnswers);
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
    if (element.task_type === 'single_choice' && typeof content.correctAnswers?.[0] !== 'undefined') {
      return String(content.correctAnswers[0]) === String(answer) ? maxScore : 0;
    }

    // Short Answer (case-insensitive, trims)
    if (element.task_type === 'short_answer' && typeof content.correctAnswer === 'string') {
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
    if (element.task_type === 'fill_gaps' && Array.isArray(content.gapAnswers)) {
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
      // Build feedback object keyed by task ID
      const feedbackByTask: Record<string, { score: number; feedback: string }> = {};
      answers.forEach(ans => {
        if (ans.worksheet_element_id) {
          feedbackByTask[ans.worksheet_element_id] = {
            score: ans.score || 0,
            feedback: ans.feedback || ''
          };
        }
      });

      const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);

      // Update submission with feedback data
      const { error: subError } = await supabase
        .from("submissions")
        .update({
          feedback_data: feedbackByTask,
          score: totalScore,
          status: 'graded'
        })
        .eq("id", submissionId);

      if (subError) {
        console.error('Supabase update error:', subError);
        throw subError;
      }

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
      // Build feedback object keyed by task ID
      const feedbackByTask: Record<string, { score: number; feedback: string }> = {};
      answers.forEach(ans => {
        if (ans.worksheet_element_id) {
          feedbackByTask[ans.worksheet_element_id] = {
            score: ans.score || 0,
            feedback: ans.feedback || ''
          };
        }
      });

      const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
      const maxScore = elements.reduce((sum, el) => sum + ((el.content?.points as number) || 1), 0);

      // Update submission with complete feedback
      const { error: subError } = await supabase
        .from("submissions")
        .update({
          feedback_data: feedbackByTask,
          score: totalScore,
          feedback: `Beoordeeld: ${totalScore}/${maxScore} punten`,
          status: 'graded'
        })
        .eq("id", submissionId);

      if (subError) {
        console.error('Supabase submissions update error:', subError);
        throw subError;
      }

      alert("✅ Beoordeling verstuurd naar student!");
      router.push("/teacher-submissions");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onbekende fout bij versturen");
    }
    setSaving(false);
  };

  if (loading) return <AuthenticatedLayout><div className="p-8">Laden...</div></AuthenticatedLayout>;
  if (error) return <AuthenticatedLayout><div className="p-8 text-red-600">{error}</div></AuthenticatedLayout>;
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
    <AuthenticatedLayout>
      <div style={{ padding: "40px", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif" }}>
        <button
          onClick={() => router.push("/teacher-submissions")}
          style={{ marginBottom: "20px", padding: "8px 12px", cursor: "pointer" }}
        >
          ← Terug naar overzicht
        </button>
        <h1>Beoordeling: {worksheet.title}</h1>
        <a href={`/teacher-submissions/${submissionId}`} style={{ fontSize: "0.9em", color: "#00e" }}>
          Inzending ID: {submissionId}
        </a>
        <p>
          <strong>Totale score: {sum} / {maxSum} ({maxSum > 0 ? ((sum / maxSum) * 100).toFixed(0) : 0}%)</strong>
        </p>
        {elements.map((el, idx) => {
          const ans = answers.find(a => a.worksheet_element_id === el.id);
          const content = el.content as Record<string, any>;
          const question = content?.question || content?.title || "Vraag zonder titel";
          const maxPoints = content?.points || 1;
          return (
            <div key={el.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "15px", borderRadius: "6px" }}>
              <h3>{idx + 1}. {question}</h3>
              <p style={{ fontSize: "0.9em", fontStyle: "italic", marginBottom: "8px" }}>
                Antwoord: {ans?.answer || "Geen antwoord"}
              </p>
              <div style={{ marginTop: "12px" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Feedback:</label>
                <textarea
                  value={ans?.feedback || ""}
                  onChange={e => {
                    const updated = answers.map(a =>
                      a.worksheet_element_id === el.id ? { ...a, feedback: e.target.value } : a
                    );
                    setAnswers(updated);
                  }}
                  placeholder="Feedback voor deze vraag..."
                  style={{ width: "100%", minHeight: "60px", padding: "6px" }}
                />
              </div>
              <div style={{ marginTop: "12px" }}>
                <label style={{ marginRight: "8px" }}>Score (0-{maxPoints}):</label>
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  value={String(ans?.score || 0)}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    const updated = answers.map(a =>
                      a.worksheet_element_id === el.id ? { ...a, score: isNaN(val) ? 0 : val } : a
                    );
                    setAnswers(updated);
                  }}
                  placeholder={`Score (max ${maxPoints} punten)`}
                  style={{ width: "80px", padding: "4px" }}
                />
                <span style={{ marginLeft: "8px", fontSize: "0.9em" }}>/{maxPoints} punten</span>
                <button
                  onClick={() => {
                    if (!ans?.answer) return;
                    const autoScore = calculateAutoScore(el, ans.answer);
                    const updated = answers.map(a =>
                      a.worksheet_element_id === el.id ? { ...a, score: autoScore } : a
                    );
                    setAnswers(updated);
                  }}
                  style={{ marginLeft: "12px", padding: "4px 8px", fontSize: "0.9em" }}
                >
                  Opslaan
                </button>
              </div>
            </div>
          );
        })}
        <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
          <button
            onClick={handleAutoScore}
            style={{ padding: "10px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            🤖 Auto-score alle antwoorden
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "10px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Opslaan..." : "💾 Opslaan"}
          </button>
          <button
            onClick={handleSend}
            disabled={saving}
            style={{ padding: "10px 16px", backgroundColor: "#17a2b8", color: "white", border: "none", borderRadius: "4px", cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Versturen..." : "✉️ Verstuur naar student"}
          </button>
        </div>
        {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}
      </div>
    </AuthenticatedLayout>
  );
}
