"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Worksheet, Submission, SubmissionElement, WorksheetElement } from "../../types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { Worksheet, Submission, WorksheetElement, SubmissionElement } from "../../../types/database";

export default function TeacherSubmissionsPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedWorksheet, setSelectedWorksheet] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [elements, setElements] = useState<WorksheetElement[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch worksheets owned by the teacher
  useEffect(() => {
    const fetchWorksheets = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data, error } = await supabase
        .from("worksheets")
        .select("id, title")
        .eq("owner_id", user.id);
      if (error) setError(error.message);
      else setWorksheets(data || []);
    };
    fetchWorksheets();
  }, []);

  // Fetch submissions for selected worksheet
  useEffect(() => {
    if (!selectedWorksheet) return;
    setSelectedSubmission(null); // Reset detail panel every time worksheet changes
    setAnswers([]);
    setElements([]);
    
    const fetchSubmissions = async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, user_id, created_at, feedback, score, users: user_id (email)")
        .eq("worksheet_id", selectedWorksheet)
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setSubmissions(data || []);
      
    };
    fetchSubmissions();
  }, [selectedWorksheet]);

  // Fetch answers for selected submission
  useEffect(() => {
    if (!selectedSubmission) return;
    
    const fetchElements = async () => {
      const { data: elementsData, error: elError } = await supabase
        .from("worksheet_elements")
        .select("id, content")
        .eq("worksheet_id", selectedWorksheet);
      if (elError) setError(elError.message);
      else setElements(elementsData || []);
      
    };
    fetchElements();
  }, [selectedSubmission, selectedWorksheet]);

  // Fetch answers for selected submission
  const [answers, setAnswers] = useState<SubmissionElement[]>([]);
  useEffect(() => {
    setAnswers([]);
    if (!selectedSubmission) return;
    const fetchAnswers = async () => {
      const { data, error } = await supabase
        .from("submission_elements")
        .select("worksheet_element_id, answer, feedback, score")
        .eq("submission_id", selectedSubmission.id);
      if (error) setError(error.message);
      else setAnswers(data || []);
      
    };
    fetchAnswers();
  }, [selectedSubmission, selectedWorksheet]);

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto" }}>
      <h2>Inzendingen per werkblad</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {/* Worksheet selector */}
      <div style={{ marginBottom: 24 }}>
        <label>
          Kies werkblad:
          <select
            value={selectedWorksheet || ""}
            onChange={e => {
              setSelectedWorksheet(e.target.value);
              setSelectedSubmission(null);
              setAnswers([]);
              setElements([]);
            }}
            style={{ marginLeft: 8 }}
          >
            <option value="">-- Kies --</option>
            {worksheets.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.title}</option>
            ))}
          </select>
        </label>
      </div>
      {/* Submissions list */}
      {selectedWorksheet && (
        <div style={{ marginBottom: 24 }}>
          <h3>Inzendingen</h3>
          {submissions.length === 0 ? (
            <div>Geen inzendingen gevonden.</div>
          ) : (
            <ul>
              {submissions.map(sub => (
                <li key={sub.id}>
                  <button onClick={() => setSelectedSubmission(sub)}>
                    {sub.users?.email || sub.user_id} ({new Date(sub.created_at).toLocaleString()})
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Submission detail */}
      {selectedSubmission && (
        <div style={{ border: "1px solid #666", padding: 24, marginTop: 24 }}>
          <h4>Antwoorden</h4>
          {/* Totale score als percentage */}
          {(() => {
            // Map: elementId -> max_score
            const elMaxScores: Record<string, number> = {};
            elements.forEach(el => {
              elMaxScores[el.id] = typeof el.max_score === 'number' ? el.max_score : 1;
            });
            // Only count answers for elements that exist
            const scored = answers
              .map(a => {
                const score = typeof a.score === 'number' ? a.score : (a.score ? parseInt(a.score) : null);
                const max = a.worksheet_element_id ? (elMaxScores[a.worksheet_element_id] || 1) : 1;
                return score !== null ? { score, max } : null;
              })
              .filter(Boolean) as { score: number; max: number }[];
            const sum = scored.reduce((acc, s) => acc + (s.score || 0), 0);
            const maxSum = scored.reduce((acc, s) => acc + (s.max || 1), 0);
            return maxSum > 0 ? (
              <div style={{ marginBottom: 16, fontWeight: 'bold', fontSize: 18 }}>
                Totale score: {sum} / {maxSum} ({Math.round((sum / maxSum) * 100)}%)
              </div>
            ) : null;
          })()}

          {elements.map(el => {
            const answerObj = answers.find(a => a.worksheet_element_id === el.id);
            return (
              <div key={el.id} style={{ marginBottom: 24, borderBottom: '1px solid #333', paddingBottom: 12 }}>
                <b>{JSON.parse(el.content).text}</b>
                <div style={{ marginLeft: 16, marginBottom: 8 }}>
                  <span style={{ color: '#ccc' }}>Antwoord:</span> {answerObj ? answerObj.answer : <i>Geen antwoord</i>}
                </div>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const feedback = (form.elements.namedItem('feedback') as HTMLInputElement).value;
                    const score = (form.elements.namedItem('score') as HTMLInputElement).value;
                    
                    setError(null);
                    const { error } = await supabase
                      .from('submission_elements')
                      .update({ feedback, score: score ? parseInt(score) : null })
                      .eq('submission_id', selectedSubmission.id)
                      .eq('worksheet_element_id', el.id);
                    
                    if (error) setError(error.message);
                    else {
                      setAnswers(answers.map(a => a.worksheet_element_id === el.id ? { ...a, feedback, score: parseFloat(score) || 0 } : a));
                    }
                  }}
                  style={{ marginTop: 8 }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <label>
                      Feedback:<br />
                      <textarea
                        name="feedback"
                        defaultValue={answerObj?.feedback || ''}
                        rows={2}
                        style={{ width: '100%', padding: 6, marginTop: 4 }}
                        placeholder="Feedback voor deze vraag..."
                      />
                    </label>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label>
                      Score (0-{el.max_score ?? 1}):
                      <input
                        name="score"
                        type="number"
                        min={0}
                        max={el.max_score ?? 1}
                        defaultValue={answerObj?.score ?? ''}
                        style={{ width: 100, padding: 6, marginLeft: 8, marginTop: 4 }}
                        placeholder={`Score (max ${el.max_score ?? 1})`}
                      />
                      <span style={{ marginLeft: 8, color: '#888' }}>
                        /{el.max_score ?? 1} punten
                      </span>
                    </label>
                  </div>
                  <button type="submit" style={{ padding: '4px 18px', fontSize: 14 }}>Opslaan</button>
                </form>
                {answerObj?.feedback && (
                  <div style={{ marginTop: 6, color: '#7f7' }}><b>Feedback:</b> {answerObj.feedback}</div>
                )}
                {typeof answerObj?.score !== 'undefined' && answerObj?.score !== null && (
                  <div style={{ color: '#7af' }}><b>Score:</b> {answerObj.score}/100</div>
                )}
              </div>
            );
          })}

          <button onClick={() => setSelectedSubmission(null)} style={{ marginTop: 16 }}>
            Terug naar inzendingen
          </button>
        </div>
      )}
    </div>
  );
}
