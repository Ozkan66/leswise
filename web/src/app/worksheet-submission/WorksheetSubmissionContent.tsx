"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Worksheet, Task } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';



// Sortable Item Component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <div className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${isDragging ? 'shadow-lg ring-2 ring-blue-500/20' : ''}`}>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <GripVertical size={20} />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Task Input Component for interactive answering
function TaskInput({
  task,
  answer,
  onAnswerChange
}: {
  task: Task;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAnswerChange: (answer: any) => void;
}) {
  const content = task.content as Record<string, unknown>;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const renderTaskInput = () => {
    switch (task.task_type as string) {
      case 'multiple-choice':
        const mcOptions = content?.options as string[] || [];
        const selectedOptions = answer || [];

        return (
          <div className="mt-6 space-y-3">
            {mcOptions.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-accent/50",
                  selectedOptions.includes(idx)
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                )}
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const newAnswer = selectedOptions.includes(idx)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? selectedOptions.filter((i: number) => i !== idx)
                    : [...selectedOptions, idx];
                  onAnswerChange(newAnswer);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                    selectedOptions.includes(idx)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground"
                  )}>
                    {selectedOptions.includes(idx) && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-base font-medium">{option}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'single_choice':
        const scOptions = content?.options as string[] || [];
        const selectedOption = answer ?? null;

        return (
          <div className="mt-6 space-y-3">
            {scOptions.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-accent/50",
                  selectedOption === idx
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                )}
                onClick={() => onAnswerChange(idx)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                    selectedOption === idx
                      ? "border-primary"
                      : "border-muted-foreground"
                  )}>
                    {selectedOption === idx && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-base font-medium">{option}</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <div className="mt-6">
            <input
              type="text"
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type je antwoord hier..."
              className="w-full p-4 text-lg bg-background rounded-xl border-2 border-input focus:border-primary focus:ring-0 transition-colors"
            />
          </div>
        );

      case 'essay':
        return (
          <div className="mt-6">
            <textarea
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Schrijf je antwoord hier..."
              rows={12}
              className="w-full p-4 text-base bg-background rounded-xl border-2 border-input focus:border-primary focus:ring-0 transition-colors resize-none leading-relaxed"
            />
          </div>
        );

      case 'matching':
        const leftItems = content?.leftItems as string[] || [];
        const rightItems = content?.rightItems as string[] || [];
        const currentMatchOrder = Array.isArray(answer)
          ? answer
          : rightItems.map((_, i) => i);

        const handleDragEndMatching = (event: DragEndEvent) => {
          const { active, over } = event;
          if (active.id !== over?.id) {
            const oldIndex = currentMatchOrder.indexOf(parseInt(active.id as string));
            const newIndex = currentMatchOrder.indexOf(parseInt(over?.id as string));
            const newOrder = arrayMove(currentMatchOrder, oldIndex, newIndex);
            onAnswerChange(newOrder);
          }
        };

        return (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Items</h4>
                {leftItems.map((item, idx) => (
                  <div key={idx} className="h-[72px] flex items-center px-6 bg-muted/50 rounded-xl border border-border font-medium">
                    {item}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Matches (Sleep om te ordenen)</h4>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndMatching}
                  id={`dnd-context-matching-${task.id}`}
                >
                  <SortableContext
                    items={currentMatchOrder.map(String)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {currentMatchOrder.map((rightItemIndex: number) => (
                        <SortableItem key={rightItemIndex} id={String(rightItemIndex)}>
                          <div className="h-[46px] flex items-center font-medium">
                            {rightItems[rightItemIndex]}
                          </div>
                        </SortableItem>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        );

      case 'ordering':
        const items = content?.items as string[] || [];
        const order = answer || [...Array(items.length).keys()];

        const handleDragEndOrdering = (event: DragEndEvent) => {
          const { active, over } = event;
          if (active.id !== over?.id) {
            const oldIndex = order.indexOf(parseInt(active.id as string));
            const newIndex = order.indexOf(parseInt(over?.id as string));
            const newOrder = arrayMove(order, oldIndex, newIndex);
            onAnswerChange(newOrder);
          }
        };

        return (
          <div className="mt-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEndOrdering}
              id={`dnd-context-ordering-${task.id}`}
            >
              <SortableContext
                items={order.map(String)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {order.map((itemIndex: number, position: number) => (
                    <div key={itemIndex} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-8 text-right">
                        {position + 1}.
                      </span>
                      <div className="flex-1">
                        <SortableItem id={String(itemIndex)}>
                          <div className="h-[46px] flex items-center font-medium">
                            {items[itemIndex]}
                          </div>
                        </SortableItem>
                      </div>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        );

      case 'fill_gaps':
      case 'fill-gaps':
        // Support both legacy 'text' and new 'textWithGaps' fields
        const gapText = (content?.textWithGaps || content?.text || '') as string;
        const gapAnswers = answer || {};

        // Split by [gap], ___ or any content in brackets like [answer]
        const parts = gapText.split(/\[[^\]]+\]|___/);

        return (
          <div className="mt-6">
            <div className="p-6 bg-muted/30 rounded-xl border border-border leading-loose text-lg font-medium">
              {parts.map((part, index) => (
                <span key={index}>
                  <span className="whitespace-pre-wrap">{part}</span>
                  {index < parts.length - 1 && (
                    <span className="inline-block align-middle mx-1">
                      <input
                        type="text"
                        value={gapAnswers[index] || ''}
                        onChange={(e) => {
                          const newAnswers = { ...gapAnswers, [index]: e.target.value };
                          onAnswerChange(newAnswers);
                        }}
                        placeholder="..."
                        className="w-40 px-3 py-1.5 text-base text-center bg-background border-2 border-muted hover:border-primary/50 focus:border-primary rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                      />
                    </span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center italic">
              Vul de ontbrekende woorden in de tekst in.
            </p>
          </div>
        );

      case 'open-question':
        return (
          <div className="mt-6">
            <textarea
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Schrijf je antwoord hier..."
              rows={8}
              className="w-full p-4 text-base bg-background rounded-xl border-2 border-input focus:border-primary focus:ring-0 transition-colors resize-none"
            />
          </div>
        );

      case 'information':
        const infoText = content?.text as string || '';
        return (
          <div className="mt-6 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{infoText}</p>
          </div>
        );

      default:
        return (
          <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            Onbekend taaktype: {task.task_type}
          </div>
        );
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {renderTaskInput()}
    </div>
  );
}

export default function WorksheetSubmissionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const worksheetId = searchParams.get('worksheetId');

  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    if (!worksheetId) {
      setError('No worksheet ID provided');
      setLoading(false);
      return;
    }

    fetchWorksheetAndTasks();
  }, [worksheetId, user]);

  const fetchWorksheetAndTasks = async () => {
    if (!user || !worksheetId) return;

    try {
      setLoading(true);

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Use API route to fetch worksheet and tasks (bypasses RLS)
      const response = await fetch(`/api/worksheet-fetch?worksheetId=${worksheetId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch worksheet');
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error('Invalid response from server');
      }

      const { worksheet: worksheetData, tasks: tasksData } = result.data;

      setWorksheet(worksheetData);
      setTasks(tasksData || []);

      // Check if there's an existing submission
      const { data: existingSubmission } = await supabase
        .from('submissions')
        .select('answers')
        .eq('worksheet_id', worksheetId)
        .eq('user_id', user.id)
        .single();

      if (existingSubmission?.answers) {
        setAnswers(existingSubmission.answers as Record<string, any>);
      }

    } catch (err) {
      console.error('Error fetching worksheet:', err);
      setError(err instanceof Error ? err.message : 'Failed to load worksheet');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (taskId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [taskId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!user || !worksheetId) return;

    try {
      setSubmitting(true);

      // Check if submission already exists
      const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('worksheet_id', worksheetId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing submission
        const { error } = await supabase
          .from('submissions')
          .update({
            answers,
            submitted_at: new Date().toISOString(),
            status: 'submitted'
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new submission
        const { error } = await supabase
          .from('submissions')
          .insert({
            worksheet_id: worksheetId,
            user_id: user.id,
            answers,
            submitted_at: new Date().toISOString(),
            status: 'submitted'
          });

        if (error) throw error;
      }

      toast.success('Je antwoorden zijn succesvol ingeleverd!');
      router.push('/student-submissions');

    } catch (err) {
      console.error('Error submitting:', err);
      toast.error('Fout bij inleveren: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !worksheet) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <div className="text-lg text-destructive mb-4">{error || 'Worksheet not found'}</div>
        <Button onClick={() => router.push('/student-submissions')}>
          Terug naar Mijn Inzendingen
        </Button>
      </div>
    );
  }

  const currentTask = tasks[currentTaskIndex];
  const progress = tasks.length > 0 ? ((currentTaskIndex + 1) / tasks.length) * 100 : 0;
  const isLastQuestion = currentTaskIndex === tasks.length - 1;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{worksheet.title}</h1>
          {worksheet.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {worksheet.description}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Vraag {currentTaskIndex + 1} van {tasks.length}</span>
            <span>{Math.round(progress)}% voltooid</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        {tasks.length > 0 && currentTask ? (
          <Card className="border-2 shadow-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="space-y-1">
                  <Badge variant="outline" className="mb-2 capitalize">
                    {currentTask.task_type?.replace(/[-_]/g, ' ')}
                  </Badge>
                  <h2 className="text-xl md:text-2xl font-semibold leading-tight">
                    {(currentTask.content as any)?.title || (currentTask.content as any)?.question || 'Untitled Task'}
                  </h2>
                  {(currentTask.content as any)?.description && (
                    <p className="text-muted-foreground pt-2">
                      {(currentTask.content as any).description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0 text-base px-3 py-1">
                  {(currentTask.content as any)?.points || 1} ptn
                </Badge>
              </div>

              <TaskInput
                task={currentTask}
                answer={answers[currentTask.id]}
                onAnswerChange={(answer) => handleAnswerChange(currentTask.id, answer)}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="text-center p-12 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">Dit werkblad bevat nog geen vragen.</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentTaskIndex === 0}
            className="w-32"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Vorige
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-32 bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? 'Bezig...' : 'Inleveren'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="w-32"
            >
              Volgende
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
