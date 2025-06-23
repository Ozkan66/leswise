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
  const anonymousCode = searchParams.get("anonymous");
  const [elements, setElements] = useState<WorksheetElement[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [mySubmissionElements, setMySubmissionElements] = useState<SubmissionElement[]>([]);
  
  // Anonymous submission state
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");
  const [anonymousLink, setAnonymousLink] = useState<{
    id: string;
    worksheet_id: string;
    link_code: string;
    max_attempts?: number;
    attempts_used?: number;
    expires_at?: string;
    is_active: boolean;
    worksheets?: { title?: string };
  } | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [attemptLimitReached, setAttemptLimitReached] = useState(false);

  useEffect(() => {
    if (!worksheetId && !anonymousCode) return;
    const checkAccessAndFetchElements = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let currentWorksheetId = worksheetId;
        
        // Handle anonymous access
        if (anonymousCode) {
          const { data: linkData, error: linkError } = await supabase
            .from("anonymous_links")
            .select("*, worksheets(id, title)")
            .eq("link_code", anonymousCode)
            .eq("is_active", true)
            .single();
            
          if (linkError || !linkData) {
            setError("Invalid or expired anonymous link");
            setLoading(false);
            return;
          }
          
          // Check if link has expired
          if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
            setError("This anonymous link has expired");
            setLoading(false);
            return;
          }
          
          // Check attempt limits
          if (linkData.max_attempts && linkData.attempts_used >= linkData.max_attempts) {
            setAttemptLimitReached(true);
            setError(`Maximum attempts (${linkData.max_attempts}) reached for this worksheet`);
            setLoading(false);
            return;
          }
          
          setAnonymousLink(linkData);
          setIsAnonymous(true);
          setHasAccess(true);
          currentWorksheetId = linkData.worksheet_id;
        } else {
          // Check user access for regular sharing
          const user = (await supabase.auth.getUser()).data.user;
          if (!user) {
            setError("You must be logged in to access this worksheet");
            setLoading(false);
            return;
          }
          
          // Check if user has access to this worksheet
          const { data: hasAccessData, error: accessError } = await supabase
            .rpc('user_has_worksheet_access', {
              p_user_id: user.id,
              p_worksheet_id: worksheetId,
              p_required_permission: 'submit'
            });
            
          if (accessError) {
            console.error('Error checking worksheet access:', accessError);
            setError("Error checking worksheet permissions. Please try again.");
            setLoading(false);
            return;
          }
            
          if (!hasAccessData) {
            setError("You don't have permission to access this worksheet");
            setLoading(false);
            return;
          }
          
          setHasAccess(true);
        }
        
        // Fetch worksheet elements
        const { data, error } = await supabase
          .from("worksheet_elements")
          .select("id, content, max_score")
          .eq("worksheet_id", currentWorksheetId)
          .order("position");
          
        if (error) {
          setError(error.message);
        } else {
          setElements(data || []);
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load worksheet";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccessAndFetchElements();
  }, [worksheetId, anonymousCode]);

  // Fetch latest submission for this worksheet by the logged-in user (skip for anonymous)
  useEffect(() => {
    if (!worksheetId || isAnonymous) return;
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
  }, [worksheetId, submitted, isAnonymous]);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const currentWorksheetId = isAnonymous ? anonymousLink?.worksheet_id : worksheetId;
    if (!currentWorksheetId) return;
    
    // Validation: all fields must be filled
    const emptyFields = elements.filter(el => !answers[el.id] || answers[el.id].trim() === "");
    if (emptyFields.length > 0) {
      setError("Vul alle vragen in voordat je indient.");
      return;
    }
    
    // Anonymous submission validation
    if (isAnonymous && !anonymousName.trim()) {
      setError("Vul je naam in om door te gaan.");
      return;
    }
    
    try {
      if (isAnonymous) {
        // Handle anonymous submission
        // First check and increment attempts
        const { data: canSubmit, error: attemptError } = await supabase
          .rpc('check_and_increment_attempts', {
            p_user_id: null,
            p_worksheet_id: currentWorksheetId,
            p_anonymous_link_id: anonymousLink?.id
          });
          
        if (attemptError) {
          console.error('Error checking attempt limits:', attemptError);
          setError("Error checking attempt limits. Please try again.");
          return;
        }
          
        if (!canSubmit) {
          setError("Maximum attempts reached for this worksheet.");
          return;
        }
        
        // Create anonymous submission record
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { error: anonSubError } = await supabase
          .from("anonymous_submissions")
          .insert({
            anonymous_link_id: anonymousLink?.id,
            worksheet_id: currentWorksheetId,
            participant_name: anonymousName,
            session_id: sessionId
          })
          .select()
          .single();
          
        if (anonSubError) throw anonSubError;
        
        // For now, we don't store the actual answers for anonymous submissions
        // This could be extended if needed
        alert(`Thank you ${anonymousName}! Your anonymous submission has been recorded.`);
        setSubmitted(true);
        
      } else {
        // Handle regular user submission
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Niet ingelogd");
        
        // Check attempt limits for regular users
        const { data: canSubmit, error: attemptError } = await supabase
          .rpc('check_and_increment_attempts', {
            p_user_id: user.id,
            p_worksheet_id: currentWorksheetId,
            p_anonymous_link_id: null
          });
          
        if (attemptError) {
          console.error('Error checking attempt limits:', attemptError);
          setError("Error checking attempt limits. Please try again.");
          return;
        }
          
        if (!canSubmit) {
          setError("Maximum attempts reached for this worksheet.");
          return;
        }
        
        // Create submission
        const { data: submission, error: subError } = await supabase
          .from("submissions")
          .insert({ worksheet_id: currentWorksheetId, user_id: user.id })
          .select()
          .single();
          
        if (subError) throw subError;
        
        // Create submission elements
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
      }
      
    } catch (err: unknown) {
      setError((err as Error).message || "Onbekende fout bij indienen");
    }
  };

  const currentWorksheetId = isAnonymous ? anonymousLink?.worksheet_id : worksheetId;
  if (!currentWorksheetId && !loading) return <div>Worksheet ID ontbreekt in de URL.</div>;
  if (loading) return <div>Vragen laden...</div>;
  if (!hasAccess) return <div>{error || "You don't have access to this worksheet."}</div>;
  if (attemptLimitReached) return <div>{error}</div>;

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
          // Handle content as either string (old format) or object (new format)
          const contentObj = typeof el.content === 'string' 
            ? JSON.parse(el.content) 
            : el.content;
          const questionText = (contentObj as { text?: string, question?: string })?.text || (contentObj as { text?: string, question?: string })?.question || 'Question text not available';
          
          return (
            <div key={el.id} style={{ marginBottom: 24, borderBottom: '1px solid #333', paddingBottom: 12 }}>
              <b>{questionText}</b> <span style={{ color: '#888' }}>(max {el.max_score} punten)</span>
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
      <h2>{isAnonymous ? "Anonymous Worksheet" : "Beantwoord de vragen"}</h2>
      {isAnonymous && anonymousLink && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#e8f5e8', borderRadius: 4 }}>
          <p><strong>Anonymous Access</strong></p>
          <p>Worksheet: {anonymousLink.worksheets?.title}</p>
          {anonymousLink.max_attempts && (
            <p>Attempts used: {anonymousLink.attempts_used} / {anonymousLink.max_attempts}</p>
          )}
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {isAnonymous && (
          <div style={{ marginBottom: 24 }}>
            <label>
              <b>Your Name (optional but recommended):</b>
              <br />
              <input
                type="text"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 8 }}
                placeholder="Enter your name or alias"
                required
              />
            </label>
          </div>
        )}
        {elements.map((el) => {
          // Handle content as either string (old format) or object (new format)
          const contentObj = typeof el.content === 'string' 
            ? JSON.parse(el.content) 
            : el.content;
            const questionText = (contentObj as { text?: string, question?: string })?.text || (contentObj as { text?: string, question?: string })?.question || 'Question text not available';
          
          return (
            <div key={el.id} style={{ marginBottom: 24 }}>
              <label>
                <b>{questionText}</b>
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
          );
        })}
        <button type="submit" style={{ padding: "8px 24px" }}>
          {isAnonymous ? "Submit Anonymous Response" : "Indienen"}
        </button>
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
