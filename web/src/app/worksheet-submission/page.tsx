"use client";
import { useEffect, useState } from "react";
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
  const [canRetry, setCanRetry] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState<{current: number, max: number} | null>(null);

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
          .select("id, type, content, max_score")
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
      
      // Check how many submissions this user has made for this worksheet
      const { data: submissionCount, error: countError } = await supabase
        .from("submissions")
        .select("id", { count: 'exact', head: true })
        .eq("worksheet_id", worksheetId)
        .eq("user_id", user.id);
        
      console.log('User submission count:', submissionCount?.length || 0);
      
      // Get the latest submission
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
        
        // Check if user can still submit more attempts
        // For now, we'll show the submission view but later we can add "Submit Again" button
        console.log('Latest submission found:', submission.id);
        
      } else {
        setMySubmission(null);
        setMySubmissionElements([]);
        console.log('No previous submissions found');
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
    
    // Validation: all fields must be filled based on question type
    const incompleteFields = elements.filter(el => {
      // Skip text elements (they are informational only)
      if (el.type === 'text') return false;
      
      const contentObj = typeof el.content === 'string' ? JSON.parse(el.content) : el.content;
      
      switch (el.type) {
        case 'multiple_choice':
        case 'single_choice':
          return !answers[el.id] || answers[el.id].trim() === "";
        
        case 'matching':
          // Check if all matching pairs have answers
          const pairs = (contentObj as { pairs?: Array<{left: string, right: string}> })?.pairs || [];
          return pairs.some((_, index) => !answers[`${el.id}_${index}`] || answers[`${el.id}_${index}`].trim() === "");
        
        case 'ordering':
          // Check if all ordering items have position numbers
          const items = (contentObj as { correctOrder?: string[] })?.correctOrder || [];
          return items.some((_, index) => !answers[`${el.id}_${index}`] || answers[`${el.id}_${index}`].trim() === "");
        
        case 'fill_gaps':
          // Check if all gaps are filled
          const gapCount = ((contentObj as { textWithGaps?: string })?.textWithGaps || '').split('[gap]').length - 1;
          for (let i = 0; i < gapCount; i++) {
            if (!answers[`${el.id}_gap_${i}`] || answers[`${el.id}_gap_${i}`].trim() === "") {
              return true;
            }
          }
          return false;
        
        default:
          // For short_answer, essay, etc.
          return !answers[el.id] || answers[el.id].trim() === "";
      }
    });
    
    if (incompleteFields.length > 0) {
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
        console.log('Attempting anonymous submission for worksheet:', currentWorksheetId);
        
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
        console.log('Attempting regular user submission for worksheet:', currentWorksheetId);
        
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Niet ingelogd");
        
        console.log('User attempting submission:', user.id);
        
        // Check if user profile exists
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error checking user profile:', profileError);
          throw new Error("Gebruikersprofiel niet gevonden. Log opnieuw in.");
        }
        
        if (!userProfile) {
          throw new Error("Gebruikersprofiel niet gevonden. Log opnieuw in.");
        }
        
        console.log('User profile found, continuing...');
        
        // Verify user still has access to this worksheet before submitting
        const { data: accessCheck, error: accessError } = await supabase
          .rpc('user_has_worksheet_access', {
            p_user_id: user.id,
            p_worksheet_id: currentWorksheetId,
            p_required_permission: 'submit'
          });
          
        if (accessError) {
          console.error('Error checking worksheet access:', accessError);
          throw new Error("Fout bij controleren van toegang tot worksheet");
        }
        
        if (!accessCheck) {
          throw new Error("Je hebt geen toegang (meer) tot deze worksheet");
        }
        
        console.log('User has access, proceeding with submission');
        
        // Check attempt limits for regular users
        console.log('Checking attempt limits for user:', user.id, 'worksheet:', currentWorksheetId);
        const { data: canSubmit, error: attemptError } = await supabase
          .rpc('check_and_increment_attempts', {
            p_user_id: user.id,
            p_worksheet_id: currentWorksheetId,
            p_anonymous_link_id: null
          });
          
        console.log('Attempt check result:', { canSubmit, attemptError });
          
        if (attemptError) {
          console.error('Error checking attempt limits:', attemptError);
          console.error('Error details:', JSON.stringify(attemptError, null, 2));
          // Don't block submission if attempt check fails - proceed with warning
          console.warn('Proceeding with submission despite attempt check error');
        } else if (canSubmit === false) {
          setError("Maximum attempts reached for this worksheet.");
          return;
        }
        
        console.log('Creating submission record...');
        // Create submission - if attempt check failed, we still allow submission for now
        const { data: submission, error: subError } = await supabase
          .from("submissions")
          .insert({ worksheet_id: currentWorksheetId, user_id: user.id })
          .select()
          .single();
          
        if (subError) {
          console.error('Submission creation error:', subError);
          console.error('Submission error details:', JSON.stringify(subError, null, 2));
          
          // Provide more specific error messages based on the error
          if (subError.message?.includes('permission denied')) {
            throw new Error("Je hebt geen toestemming om deze worksheet in te dienen");
          } else if (subError.message?.includes('foreign key')) {
            throw new Error("Worksheet niet gevonden of je hebt geen toegang");
          } else if (subError.message?.includes('not null')) {
            throw new Error("Ontbrekende gegevens voor indiening");
          } else {
            throw subError;
          }
        }
        
        console.log('Submission created successfully:', submission.id);
        
        // Create submission elements with proper answer formatting
        console.log('Creating submission elements...');
        const answerRows = elements.map((el) => {
          let finalAnswer = "";
          const contentObj = typeof el.content === 'string' ? JSON.parse(el.content) : el.content;
          
          switch (el.type) {
            case 'matching':
              // Combine all matching answers into a JSON string
              const pairs = (contentObj as { pairs?: Array<{left: string, right: string}> })?.pairs || [];
              const matchingAnswers = pairs.map((_, index) => answers[`${el.id}_${index}`] || '');
              finalAnswer = JSON.stringify(matchingAnswers);
              break;
            
            case 'ordering':
              // Combine all ordering answers into a JSON string
              const items = (contentObj as { correctOrder?: string[] })?.correctOrder || [];
              const orderingAnswers = items.map((_, index) => answers[`${el.id}_${index}`] || '');
              finalAnswer = JSON.stringify(orderingAnswers);
              break;
            
            case 'fill_gaps':
              // Combine all gap answers into a JSON string
              const gapCount = ((contentObj as { textWithGaps?: string })?.textWithGaps || '').split('[gap]').length - 1;
              const gapAnswers = [];
              for (let i = 0; i < gapCount; i++) {
                gapAnswers.push(answers[`${el.id}_gap_${i}`] || '');
              }
              finalAnswer = JSON.stringify(gapAnswers);
              break;
            
            default:
              // For simple answers (text, multiple_choice, single_choice, etc.)
              finalAnswer = answers[el.id] || "";
          }
          
          return {
            submission_id: submission.id,
            worksheet_element_id: el.id,
            answer: finalAnswer
          };
        });
        
        console.log('Answer rows to insert:', answerRows.length);
        
        const { error: elemError } = await supabase
          .from("submission_elements")
          .insert(answerRows);
          
        if (elemError) {
          console.error('Submission elements creation error:', elemError);
          throw elemError;
        }
        
        console.log('Submission completed successfully');
        setSubmitted(true);
      }
      
    } catch (err: unknown) {
      console.error('Submission error:', err);
      
      // Provide more specific error messages
      if (err && typeof err === 'object' && 'message' in err) {
        const errorMessage = (err as Error).message;
        
        if (errorMessage.includes('permission denied') || errorMessage.includes('RLS')) {
          setError("Je hebt geen toestemming om deze worksheet in te dienen. Controleer of je de juiste toegang hebt.");
        } else if (errorMessage.includes('foreign key') || errorMessage.includes('constraint')) {
          setError("Er is een probleem met de worksheet gegevens. Probeer de pagina te verversen.");
        } else if (errorMessage.includes('authentication') || errorMessage.includes('auth')) {
          setError("Je bent niet ingelogd. Log opnieuw in en probeer het nog een keer.");
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          setError("Netwerkfout. Controleer je internetverbinding en probeer het opnieuw.");
        } else {
          setError(`Fout bij indienen: ${errorMessage}`);
        }
      } else {
        setError("Onbekende fout bij indienen. Probeer het opnieuw.");
      }
    }
  };

  const currentWorksheetId = isAnonymous ? anonymousLink?.worksheet_id : worksheetId;
  if (!currentWorksheetId && !loading) return <div>Worksheet ID ontbreekt in de URL.</div>;
  if (loading) return <div>Vragen laden...</div>;
  if (!hasAccess) return <div>{error || "You don't have access to this worksheet."}</div>;
  if (attemptLimitReached) return <div>{error}</div>;

  // Student view: show submission if exists
  if (mySubmission && mySubmissionElements.length > 0) {
    // Check if user can submit again (multiple attempts allowed)
    const canSubmitAgain = async () => {
      try {
        const { data: shareInfo } = await supabase
          .from('worksheet_shares')
          .select('max_attempts, attempts_used')
          .eq('worksheet_id', currentWorksheetId)
          .eq('shared_with_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();
          
        return shareInfo && shareInfo.max_attempts && shareInfo.attempts_used < shareInfo.max_attempts;
      } catch {
        return false;
      }
    };
    
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
          // Debug: log the type and content
          console.log('Element type:', el.type, 'Element content:', el.content);
          // Handle content as either string (old format) or object (new format)
          const contentObj = typeof el.content === 'string' 
            ? JSON.parse(el.content) 
            : el.content;
          const questionText = (contentObj as { text?: string, question?: string })?.text || (contentObj as { text?: string, question?: string })?.question || 'Question text not available';
          
          return (
            <div key={el.id} style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <b>{questionText}</b>
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
                  {el.type?.replace('_', ' ').toUpperCase()} ({el.max_score} punt{el.max_score !== 1 ? 'en' : ''})
                </div>
              </div>
              
              {/* Render different input types based on element type */}
              {el.type === 'multiple_choice' && (
                <div>
                  {(contentObj as { options?: string[] })?.options?.map((option: string, index: number) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={(answers[el.id] || '').split(',').includes(index.toString())}
                          onChange={(e) => {
                            const currentAnswers = (answers[el.id] || '').split(',').filter(a => a);
                            const indexStr = index.toString();
                            let newAnswers;
                            if (e.target.checked) {
                              newAnswers = [...currentAnswers, indexStr];
                            } else {
                              newAnswers = currentAnswers.filter(a => a !== indexStr);
                            }
                            handleChange(el.id, newAnswers.join(','));
                          }}
                          style={{ marginRight: 8 }}
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {el.type === 'single_choice' && (
                <div>
                  {(contentObj as { options?: string[] })?.options?.map((option: string, index: number) => (
                    <div key={index} style={{ marginBottom: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`question_${el.id}`}
                          checked={answers[el.id] === index.toString()}
                          onChange={() => handleChange(el.id, index.toString())}
                          style={{ marginRight: 8 }}
                        />
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {el.type === 'matching' && (
                <div>
                  <div style={{ marginBottom: 8, fontStyle: 'italic', color: '#666' }}>
                    Match de items door voor elk item het juiste antwoord te selecteren:
                  </div>
                  {(contentObj as { pairs?: Array<{left: string, right: string}> })?.pairs?.map((pair, index) => (
                    <div key={index} style={{ marginBottom: 12, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                      <div style={{ marginBottom: 4, fontWeight: 'bold' }}>{pair.left}</div>
                      <select
                        value={answers[`${el.id}_${index}`] || ''}
                        onChange={(e) => handleChange(`${el.id}_${index}`, e.target.value)}
                        style={{ width: '100%', padding: 4 }}
                      >
                        <option value="">Selecteer een antwoord...</option>
                        {(contentObj as { pairs?: Array<{left: string, right: string}> })?.pairs?.map((p, i) => (
                          <option key={i} value={p.right}>{p.right}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              
              {el.type === 'ordering' && (
                <div>
                  <div style={{ marginBottom: 8, fontStyle: 'italic', color: '#666' }}>
                    Zet de volgende items in de juiste volgorde (1 = eerste, 2 = tweede, etc.):
                  </div>
                  {(contentObj as { correctOrder?: string[] })?.correctOrder?.map((item, index) => (
                    <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        max={(contentObj as { correctOrder?: string[] })?.correctOrder?.length || 1}
                        value={answers[`${el.id}_${index}`] || ''}
                        onChange={(e) => handleChange(`${el.id}_${index}`, e.target.value)}
                        style={{ width: 60, marginRight: 12, padding: 4 }}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {el.type === 'fill_gaps' && (
                <div>
                  <div style={{ marginBottom: 8 }}>
                    {(contentObj as { textWithGaps?: string })?.textWithGaps?.split('[gap]').map((part, index, array) => (
                      <span key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <input
                            type="text"
                            value={answers[`${el.id}_gap_${index}`] || ''}
                            onChange={(e) => handleChange(`${el.id}_gap_${index}`, e.target.value)}
                            style={{ 
                              border: '1px solid #ccc', 
                              borderRadius: 2, 
                              padding: '2px 6px',
                              margin: '0 2px',
                              minWidth: 80
                            }}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(el.type === 'short_answer' || el.type === 'essay' || el.type === 'text' || !['multiple_choice', 'single_choice', 'matching', 'ordering', 'fill_gaps'].includes(el.type || '')) && (
                <div>
                  {el.type === 'text' ? (
                    <div style={{ 
                      padding: 12, 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: 4, 
                      fontStyle: 'italic',
                      border: '1px solid #e9ecef'
                    }}>
                      {(contentObj as { text?: string })?.text || questionText}
                    </div>
                  ) : (
                    <textarea
                      value={answers[el.id] || ""}
                      onChange={(e) => handleChange(el.id, e.target.value)}
                      style={{ 
                        width: "100%", 
                        padding: 8, 
                        marginTop: 8,
                        minHeight: el.type === 'essay' ? 120 : 60,
                        resize: 'vertical'
                      }}
                      placeholder={el.type === 'essay' ? 'Schrijf hier je uitgebreide antwoord...' : 'Vul je antwoord in...'}
                      required={el.type !== 'text'}
                    />
                  )}
                </div>
              )}
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
  return <WorksheetSubmissionContent />;
}
