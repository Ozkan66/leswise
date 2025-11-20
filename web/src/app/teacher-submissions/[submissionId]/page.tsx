"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Worksheet, Submission, Task } from "../../../types/database";
import AuthenticatedLayout from "../../../components/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import { ChevronLeft, ChevronRight, Save, Send, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TaskFeedback {
  score: number;
  feedback: string;
}

export default function SubmissionReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { submissionId } = params as { submissionId: string };

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [feedbackData, setFeedbackData] = useState<Record<string, TaskFeedback>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
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

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("worksheet_id", worksheetData.id)
        .order('order_index', { ascending: true });

      if (tasksError) {
        setError("Fout bij laden van vragen.");
        setLoading(false);
        return;
      }
      setTasks(tasksData || []);

      // Load answers from JSON field
      const answersJson = submissionData.answers as Record<string, any> || {};
      setAnswers(answersJson);

      // Load existing feedback
      const existingFeedback = submissionData.feedback_data as Record<string, TaskFeedback> || {};
      setFeedbackData(existingFeedback);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Er is een fout opgetreden bij het laden van de gegevens.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [submissionId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (e.key === "ArrowRight" && currentQuestionIndex < tasks.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestionIndex, tasks.length]);

  const handleFeedbackChange = (taskId: string, field: 'score' | 'feedback', value: any) => {
    setFeedbackData(prev => ({
      ...prev,
      [taskId]: {
        score: prev[taskId]?.score || 0,
        feedback: prev[taskId]?.feedback || '',
        [field]: field === 'score' ? parseFloat(value) || 0 : value
      }
    }));
  };

  const calculateAutoScore = (task: Task, answer: any): number => {
    const content = task.content as Record<string, any>;
    const maxScore = content?.points || 1;

    if (!answer && answer !== 0) return 0;

    switch (task.task_type) {
      case 'multiple-choice':
      case 'single_choice':
        return answer === content.correctAnswer ? maxScore : 0;

      case 'matching':
        if (typeof answer === 'object' && content.pairs) {
          const correctMatches = Object.entries(answer).filter(
            ([key, value]) => content.pairs.find((p: any) => p.left === key && p.right === value)
          ).length;
          return (correctMatches / content.pairs.length) * maxScore;
        }
        return 0;

      case 'ordering':
        if (Array.isArray(answer) && Array.isArray(content.correctOrder)) {
          const correct = answer.every((val, i) => val === content.correctOrder[i]);
          return correct ? maxScore : 0;
        }
        return 0;

      case 'fill_gaps':
        if (Array.isArray(answer) && Array.isArray(content.gapAnswers)) {
          const correctCount = answer.filter((val, i) =>
            val.trim().toLowerCase() === String(content.gapAnswers[i]).trim().toLowerCase()
          ).length;
          return (correctCount / content.gapAnswers.length) * maxScore;
        }
        return 0;

      case 'text':
      case 'information':
        return 0;

      default:
        if (typeof content.correctAnswer === 'string') {
          return String(answer).trim().toLowerCase() === content.correctAnswer.trim().toLowerCase() ? maxScore : 0;
        }
        return 0;
    }
  };

  const handleAutoScore = () => {
    const updatedFeedback = { ...feedbackData };
    tasks.forEach(task => {
      const answer = answers[task.id];
      if (answer !== undefined) {
        const autoScore = calculateAutoScore(task, answer);
        updatedFeedback[task.id] = {
          score: autoScore,
          feedback: updatedFeedback[task.id]?.feedback || ''
        };
      }
    });
    setFeedbackData(updatedFeedback);
    toast.success('Auto-score toegepast op alle vragen!');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalScore = Object.values(feedbackData).reduce((sum, f) => sum + (f.score || 0), 0);

      const { error: subError } = await supabase
        .from("submissions")
        .update({
          feedback_data: feedbackData,
          score: totalScore,
          status: 'graded'
        })
        .eq("id", submissionId);

      if (subError) throw subError;

      toast.success("Beoordeling opgeslagen!");
      await fetchData();
    } catch (err) {
      toast.error("Fout bij opslaan: " + (err instanceof Error ? err.message : "Onbekende fout"));
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    setSaving(true);
    try {
      const totalScore = Object.values(feedbackData).reduce((sum, f) => sum + (f.score || 0), 0);

      const { error: subError } = await supabase
        .from("submissions")
        .update({
          feedback_data: feedbackData,
          score: totalScore,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq("id", submissionId);

      if (subError) throw subError;

      toast.success("Beoordeling verzonden naar student!");
      router.push("/teacher-submissions");
    } catch (err) {
      toast.error("Fout bij verzenden: " + (err instanceof Error ? err.message : "Onbekende fout"));
    } finally {
      setSaving(false);
    }
  };

  const renderAnswer = (task: Task, answer: any) => {
    const content = task.content as Record<string, any>;

    if (!answer && answer !== 0) {
      return <p className="text-muted-foreground italic">Geen antwoord gegeven</p>;
    }

    switch (task.task_type) {
      case 'multiple-choice':
      case 'single_choice':
        const options = content.options || [];
        return (
          <div className="space-y-2">
            {options.map((opt: any) => (
              <div
                key={opt.value}
                className={`p-3 rounded-md border ${opt.value === answer
                    ? 'bg-blue-50 border-blue-300 font-medium'
                    : 'bg-gray-50 border-gray-200'
                  }`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        );

      case 'fill_gaps':
        const text = content.text || '';
        const gapAnswers = Array.isArray(answer) ? answer : [];
        let gapIndex = 0;
        const parts = text.split(/\{gap\}/g);
        return (
          <div className="space-y-2">
            <div className="p-4 bg-gray-50 rounded-md">
              {parts.map((part: string, i: number) => (
                <span key={i}>
                  {part}
                  {i < parts.length - 1 && (
                    <span className="inline-block px-2 py-1 mx-1 bg-blue-100 text-blue-800 rounded font-medium">
                      {gapAnswers[gapIndex++] || '___'}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        );

      case 'ordering':
        const items = Array.isArray(answer) ? answer : [];
        return (
          <div className="space-y-2">
            {items.map((item: string, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Badge variant="outline">{i + 1}</Badge>
                <span>{item}</span>
              </div>
            ))}
          </div>
        );

      case 'matching':
        const pairs = typeof answer === 'object' ? answer : {};
        return (
          <div className="space-y-2">
            {Object.entries(pairs).map(([left, right]) => (
              <div key={left} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                <span className="flex-1 font-medium">{left}</span>
                <span className="text-muted-foreground">→</span>
                <span className="flex-1">{String(right)}</span>
              </div>
            ))}
          </div>
        );

      case 'open-question':
      case 'essay':
        return (
          <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
            {String(answer)}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 rounded-md">
            {typeof answer === 'object' ? JSON.stringify(answer, null, 2) : String(answer)}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !submission || !worksheet || tasks.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="p-8 text-center">
          <p className="text-destructive">{error || "Geen gegevens gevonden"}</p>
          <Button onClick={() => router.push("/teacher-submissions")} className="mt-4">
            Terug naar overzicht
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const currentTask = tasks[currentQuestionIndex];
  const currentAnswer = answers[currentTask.id];
  const currentFeedback = feedbackData[currentTask.id] || { score: 0, feedback: '' };
  const taskContent = currentTask.content as Record<string, any>;
  const maxPoints = taskContent?.points || 1;

  // Calculate total score
  const totalScore = Object.values(feedbackData).reduce((sum, f) => sum + (f.score || 0), 0);
  const maxTotalScore = tasks.reduce((sum, t) => sum + ((t.content as any)?.points || 1), 0);

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-background pb-24">
        {/* Fixed Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/teacher-submissions")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Terug naar overzicht
              </Button>
              <Badge variant="outline" className="text-sm">
                Score: {totalScore} / {maxTotalScore} ({maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0}%)
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{worksheet.title}</h1>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Vorige
            </Button>
            <Badge variant="secondary" className="text-sm">
              Vraag {currentQuestionIndex + 1} van {tasks.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === tasks.length - 1}
              className="gap-2"
            >
              Volgende
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span>{taskContent?.question || taskContent?.title || "Vraag zonder titel"}</span>
                <Badge>{maxPoints} {maxPoints === 1 ? 'punt' : 'punten'}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Answer */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Antwoord Student</h3>
                {renderAnswer(currentTask, currentAnswer)}
              </div>

              {/* Feedback Section */}
              <div className="border-t pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Feedback</label>
                  <Textarea
                    value={currentFeedback.feedback || ""}
                    onChange={(e) => handleFeedbackChange(currentTask.id, 'feedback', e.target.value)}
                    placeholder="Geef feedback aan de student..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Score (0-{maxPoints} punten)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max={maxPoints}
                    step="0.5"
                    value={currentFeedback.score || 0}
                    onChange={(e) => handleFeedbackChange(currentTask.id, 'score', e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleAutoScore}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Auto-score
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Opslaan
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={saving}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Verzenden naar Student
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
