"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Worksheet, Submission, SubmissionElement, Task } from "../../types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Extend Submission type to include user_profiles for local use
interface SubmissionWithUserProfiles extends Submission {
  user_profiles?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Component to show submissions for a single worksheet (as cards)
const WorksheetSubmissionsCards = ({ worksheet }: { worksheet: Worksheet }) => {
  const [submissions, setSubmissions] = useState<SubmissionWithUserProfiles[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id, 
          user_id, 
          submitted_at,
          created_at, 
          feedback, 
          score,
          user_profiles!submissions_user_id_fkey(email, first_name, last_name)
        `)
        .eq("worksheet_id", worksheet.id)
        .order("submitted_at", { ascending: false });
      if (!error && data) {
        // When fetching submissions with a join, normalize user_profiles to a single object
        const normalized = data.map((sub) => ({
          ...sub,
          user_profiles: Array.isArray(sub.user_profiles) ? sub.user_profiles[0] : sub.user_profiles,
        }));
        setSubmissions(normalized);
      } else {
        // Fallback without join
        const { data: data2 } = await supabase
          .from("submissions")
          .select("id, user_id, submitted_at, created_at, feedback, score")
          .eq("worksheet_id", worksheet.id)
          .order("submitted_at", { ascending: false });
        if (data2) {
          // Replace manual enrichment loop with mapping that returns new objects
          setSubmissions(await Promise.all(
            data2.map(async (sub) => {
              const { data: userData } = await supabase
                .from("user_profiles")
                .select("email, first_name, last_name")
                .eq("user_id", sub.user_id)
                .single();
              return {
                ...sub,
                user_profiles: userData || {
                  email: `User ${sub.user_id.slice(0, 8)}...`,
                  first_name: 'Unknown',
                  last_name: 'User'
                }
              };
            })
          ));
        }
      }
      setLoading(false);
    };
    fetchSubmissions();
  }, [worksheet.id]);

  if (loading) {
    return (
      <div style={{ minWidth: 280, margin: 8, padding: 24, background: '#f8f9fa', borderRadius: 8, boxShadow: '0 1px 4px #0001' }}>
        <b>{worksheet.title}</b>
        <div style={{ color: '#888', marginTop: 8 }}>Laden...</div>
      </div>
    );
  }
  if (submissions.length === 0) {
    return (
      <div style={{ minWidth: 280, margin: 8, padding: 24, background: '#f8f9fa', borderRadius: 8, boxShadow: '0 1px 4px #0001' }}>
        <b>{worksheet.title}</b>
        <div style={{ color: '#888', marginTop: 8 }}>Geen inzendingen</div>
      </div>
    );
  }
  return (
    <>
      {submissions.map((submission) => (
        <div
          key={submission.id}
          style={{
            minWidth: 280,
            maxWidth: 340,
            margin: 8,
            padding: 24,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 1px 8px #0002",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{worksheet.title}</div>
          <div style={{ color: "#007acc", fontWeight: 500 }}>
            {submission.user_profiles?.email || `User: ${submission.user_id?.slice(0, 8)}...`}
          </div>
          <div style={{ color: "#888", fontSize: 13 }}>
            Ingediend op: {new Date(submission.created_at).toLocaleString()}
          </div>
          <div style={{ margin: "8px 0" }}>
            {submission.feedback && submission.feedback.includes("Beoordeeld") ? (
              <span style={{ color: "green" }}>
                ✅ Beoordeeld
              </span>
            ) : (
              <span style={{ color: "orange" }}>
                ⏳ Te beoordelen
              </span>
            )}
          </div>
          <button
            onClick={() => {
              // Gebruik router.push om naar de subpagina te navigeren
              window.location.href = `/teacher-submissions/${submission.id}`;
            }}
            style={{
              backgroundColor: "#007acc",
              color: "white",
              padding: "8px 0",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "15px",
              marginTop: 8,
            }}
          >
            📝 Beoordeel
          </button>
        </div>
      ))}
    </>
  );
};

export default function TeacherSubmissionsPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [elements, setElements] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch worksheets owned by the teacher
  useEffect(() => {
    const fetchWorksheets = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      console.log('Current user ID:', user.id);

      const { data, error } = await supabase
        .from("worksheets")
        .select("id, title, owner_id")
        .eq("owner_id", user.id);

      console.log('Worksheets query result:', { data, error });
      console.log('Worksheet IDs:', data?.map(w => ({ id: w.id, title: w.title })));

      if (error) setError(error.message);
      else setWorksheets(data || []);
    };
    fetchWorksheets();
  }, []);

  // Fetch submissions for selected worksheet
  useEffect(() => {
    if (!selectedSubmission) return;
    setSelectedSubmission(null); // Reset detail panel every time worksheet changes
    setAnswers([]);
    setElements([]);

    const fetchSubmissions = async () => {
      console.log('Fetching submissions for worksheet:', selectedSubmission);

      // First, let's verify the current user and worksheet ownership
      const user = (await supabase.auth.getUser()).data.user;
      console.log('Current user in fetchSubmissions:', user?.id);

      // Verify worksheet ownership
      const { data: worksheetData, error: worksheetError } = await supabase
        .from("worksheets")
        .select("id, title, owner_id")
        .eq("id", selectedSubmission)
        .single();

      console.log('Selected worksheet details:', { worksheetData, worksheetError });

      // Debug: Check total submissions count
      const { count: totalSubmissions } = await supabase
        .from("submissions")
        .select("*", { count: 'exact', head: true })
        .eq("worksheet_id", selectedSubmission);

      console.log('Total submissions for this worksheet:', totalSubmissions);

      // Debug: Show all submissions to see what worksheet_ids exist
      const { data: allSubmissions } = await supabase
        .from("submissions")
        .select("id, worksheet_id, user_id, created_at")
        .limit(10);

      console.log('All submissions in database:', allSubmissions);
      console.log('Submission details:', JSON.stringify(allSubmissions, null, 2));
      console.log('Looking for worksheet_id:', selectedSubmission);

      // Check if the submission's worksheet is owned by this teacher
      if (allSubmissions && allSubmissions.length > 0) {
        const submissionWorksheetId = allSubmissions[0].worksheet_id;
        const { data: submissionWorksheet } = await supabase
          .from("worksheets")
          .select("id, title, owner_id")
          .eq("id", submissionWorksheetId)
          .single();

        console.log('Submission is for worksheet:', submissionWorksheet);
        console.log('Is this teacher the owner?', submissionWorksheet?.owner_id === user?.id);
      }

      // Try multiple query approaches to handle different database schemas
      let submissionsData = null;
      let submissionsError = null;

      // Approach 1: Try with user_profiles join (specify the relationship)
      const { data: data1, error: error1 } = await supabase
        .from("submissions")
        .select(`
          id, 
          user_id, 
          submitted_at,
          created_at, 
          feedback, 
          score,
          user_profiles!submissions_user_id_fkey(email, first_name, last_name)
        `)
        .eq("worksheet_id", selectedSubmission)
        .order("submitted_at", { ascending: false });

      if (!error1 && data1) {
        submissionsData = data1;
        console.log('✅ Submissions found with user_profiles join:', submissionsData);
        console.log('First submission structure:', JSON.stringify(submissionsData[0], null, 2));
      } else {
        console.log('❌ user_profiles join failed:', error1);

        // Approach 1b: Try alternative join syntax
        const { data: data1b, error: error1b } = await supabase
          .from("submissions")
          .select(`
            id, 
            user_id, 
            submitted_at,
            created_at, 
            feedback, 
            score,
            user_profiles!user_id(email, first_name, last_name)
          `)
          .eq("worksheet_id", selectedSubmission)
          .order("submitted_at", { ascending: false });

        if (!error1b && data1b) {
          submissionsData = data1b;
          console.log('✅ Submissions found with alternative user_profiles join:', submissionsData);
        } else {
          console.log('❌ Alternative user_profiles join also failed:', error1b);

          // Approach 2: Try basic query without join
          const { data: data2, error: error2 } = await supabase
            .from("submissions")
            .select(`
              id, 
              user_id, 
              submitted_at,
              created_at, 
              feedback, 
              score
            `)
            .eq("worksheet_id", selectedSubmission)
            .order("submitted_at", { ascending: false });

          if (!error2 && data2) {
            // Replace manual enrichment loop with mapping that returns new objects
            submissionsData = await Promise.all(
              data2.map(async (sub) => {
                const { data: userData } = await supabase
                  .from("user_profiles")
                  .select("email, first_name, last_name")
                  .eq("user_id", sub.user_id)
                  .single();
                return {
                  ...sub,
                  user_profiles: userData || {
                    email: `User ${sub.user_id.slice(0, 8)}...`,
                    first_name: 'Unknown',
                    last_name: 'User'
                  }
                };
              })
            );
          } else {
            submissionsError = error2;
            console.log('❌ Basic submissions query ook mislukt:', error2);
          }
        }
      }

      // Set final result
      if (submissionsData) {
        // setSubmissions(submissionsData); // Verwijderd: geen setSubmissions in deze scope
      } else if (submissionsError) {
        console.error('All submission queries failed:', submissionsError);
        setError(`Error loading submissions: ${submissionsError.message}`);
      } else {
        // setSubmissions([]); // Verwijderd: geen setSubmissions in deze scope
      }

    };
    fetchSubmissions();
  }, [selectedSubmission]);

  // Fetch answers for selected submission
  useEffect(() => {
    if (!selectedSubmission) return;

    const fetchElements = async () => {
      const { data: elementsData, error: elError } = await supabase
        .from("tasks")
        .select("id, content, task_type, order_index, worksheet_id, title")
        .eq("worksheet_id", selectedSubmission)
        .order('order_index', { ascending: true });

      console.log('Elements data:', elementsData);
      console.log('Elements error:', elError);

      if (elError) setError(elError.message);
      else setElements(elementsData || []);

    };
    fetchElements();
  }, [selectedSubmission]);

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

      console.log('Fetched answers:', data);
      console.log('Answers error:', error);

      if (error) setError(error.message);
      else setAnswers(data || []);

    };
    fetchAnswers();
  }, [selectedSubmission, elements, answers]);

  // Auto-scoring function (supports all question types)
  const calculateAutoScore = (element: Task, answer: string): number => {
    if (!element.content || answer == null) return 0;
    const content = element.content as Record<string, any>;
    const maxScore = (content.points as number) || 1;

    // Multiple Choice (multiple correct answers, answer is comma-separated indices)
    if (element.task_type === 'multiple-choice' && Array.isArray(content.correctAnswers)) {
      const correct = content.correctAnswers.map(String).sort();
      const given = (answer || '').split(',').map(s => s.trim()).filter(Boolean).sort();
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

  // Auto-score all answers when submission is loaded (only for unscored answers)
  useEffect(() => {
    if (answers.length > 0 && elements.length > 0) {
      const updatedAnswers = answers.map(answer => {
        // Only auto-score if there's no score yet (null or undefined)
        if ((answer.score === null || answer.score === undefined) && answer.answer) {
          const element = elements.find(el => el.id === answer.worksheet_element_id);
          if (element) {
            const autoScore = calculateAutoScore(element, answer.answer);
            console.log(`Auto-scoring ${answer.worksheet_element_id}: ${answer.answer} -> ${autoScore}`);
            return { ...answer, score: autoScore };
          }
        }
        return answer;
      });

      // Update state if scores were auto-calculated
      const hasNewScores = updatedAnswers.some((updated, index) =>
        (updated.score !== answers[index].score) && (answers[index].score === null || answers[index].score === undefined)
      );

      if (hasNewScores) {
        setAnswers(updatedAnswers);
        console.log('Auto-scored answers (only unscored):', updatedAnswers);
      }
    }
  }, [answers.length, elements.length]);

  return (
    <div style={{ maxWidth: 1200, margin: "2rem auto" }}>
      <h2>Inzendingen Overzicht</h2>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      {/* All submissions as flex cards */}
      <div style={{ marginBottom: 24 }}>
        <h3>Alle Inzendingen</h3>
        {worksheets.length === 0 ? (
          <div>Geen werkbladen gevonden.</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch', margin: '0 -8px' }}>
            {worksheets.map(worksheet => (
              <WorksheetSubmissionsCards
                key={worksheet.id}
                worksheet={worksheet}
              />
            ))}
          </div>
        )}
      </div>
      {/* Detail-view als apart paneel onder de kaarten */}
      {selectedSubmission && (
        <div style={{ border: "1px solid #666", padding: 24, marginTop: 24, background: '#fafbfc', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>Beoordeling: {worksheets.find(w => w.id === selectedSubmission.worksheet_id)?.title}</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setAnswers([]);
                  setElements([]);
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Terug naar overzicht
              </button>
              <button
                onClick={async () => {
                  setError(null);
                  try {
                    // Auto-score all answers
                    const updatedAnswers = answers.map(answer => {
                      const element = elements.find(el => el.id === answer.worksheet_element_id);
                      if (element && answer.answer) {
                        const autoScore = calculateAutoScore(element, answer.answer);
                        return { ...answer, score: autoScore };
                      }
                      return answer;
                    });

                    setAnswers(updatedAnswers);
                    alert('Automatische scoring toegepast!');
                  } catch (err) {
                    setError(`Error auto-scoring: ${(err as Error).message}`);
                  }
                }}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                🤖 Auto-score
              </button>
              <button
                onClick={async () => {
                  setError(null);
                  try {
                    // Save all feedback and scores to database
                    for (const answer of answers) {
                      const { error } = await supabase
                        .from('submission_elements')
                        .update({
                          feedback: answer.feedback || '',
                          score: answer.score || 0
                        })
                        .eq('submission_id', selectedSubmission.id)
                        .eq('worksheet_element_id', answer.worksheet_element_id);

                      if (error) throw error;
                    }

                    // Update the submission with overall feedback
                    const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
                    const { error: submissionError } = await supabase
                      .from('submissions')
                      .update({
                        feedback: 'Beoordeeld door docent',
                        score: totalScore
                      })
                      .eq('id', selectedSubmission.id);

                    if (submissionError) throw submissionError;

                    alert('✅ Beoordeling opgeslagen in database!');
                  } catch (err) {
                    setError(`Error saving: ${(err as Error).message}`);
                  }
                }}
                style={{
                  backgroundColor: '#007acc',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                💾 Opslaan in Database
              </button>
              <button
                onClick={async () => {
                  setError(null);
                  try {
                    // First save to database
                    for (const answer of answers) {
                      const { error } = await supabase
                        .from('submission_elements')
                        .update({
                          feedback: answer.feedback || '',
                          score: answer.score || 0
                        })
                        .eq('submission_id', selectedSubmission.id)
                        .eq('worksheet_element_id', answer.worksheet_element_id);

                      if (error) throw error;
                    }

                    // Update submission status
                    const totalScore = answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
                    const maxScore = elements.reduce((sum, el) => sum + ((el.content?.points as number) || 1), 0);
                    const { error: submissionError } = await supabase
                      .from('submissions')
                      .update({
                        feedback: `Beoordeeld: ${totalScore}/${maxScore} punten`,
                        score: totalScore
                      })
                      .eq('id', selectedSubmission.id);

                    if (submissionError) throw submissionError;

                    // TODO: Send notification to student (email/in-app notification)
                    alert('✅ Beoordeling verstuurd naar student!');

                    // Refresh the page data
                    window.location.reload();
                  } catch (err) {
                    setError(`Error sending feedback: ${(err as Error).message}`);
                  }
                }}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📤 Verstuur naar Student
              </button>
            </div>
          </div>
          {/* Totale score als percentage */}
          {(() => {
            // Map: elementId -> max_score
            const elMaxScores: Record<string, number> = {};
            elements.forEach(el => {
              elMaxScores[el.id] = (el.content?.points as number) || 1;
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

            console.log('Element:', el);
            console.log('Element content type:', typeof el.content);
            console.log('Element content value:', el.content);

            // Handle content as either string (old format) or object (new format)
            let questionText = 'Question text not available';
            try {
              const contentObj = el.content as Record<string, any>;
              console.log('Parsed content:', contentObj);
              // Try different possible property names for the question text
              questionText = (contentObj as { question?: string; text?: string })?.question
                || (contentObj as { question?: string; text?: string })?.text
                || 'Question text not available';
            } catch (e) {
              console.error('Error parsing content:', e);
              questionText = 'Error parsing question content';
            }

            return (
              <div key={el.id} style={{ marginBottom: 24, borderBottom: '1px solid #333', paddingBottom: 12 }}>
                <b>{questionText}</b>
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
                      Score (0-{(el.content?.points as number) || 1}):
                      <input
                        name="score"
                        type="number"
                        min={0}
                        max={(el.content?.points as number) || 1}
                        step="0.1"
                        defaultValue={answerObj?.score !== null && answerObj?.score !== undefined ? String(answerObj.score) : ''}
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
