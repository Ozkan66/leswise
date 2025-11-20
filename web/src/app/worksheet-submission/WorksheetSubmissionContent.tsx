"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Worksheet, Task } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Answer {
  taskId: string;
  answer: any;
}

export default function WorksheetSubmissionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const worksheetId = searchParams.get('worksheetId');

  const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      console.log('Fetched worksheet:', worksheetData.title);
      console.log('Fetched tasks count:', tasksData?.length || 0);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading worksheet...</div>
      </div>
    );
  }

  if (error || !worksheet) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-lg text-red-600 mb-4">{error || 'Worksheet not found'}</div>
        <button
          onClick={() => router.push('/student-submissions')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Terug naar Mijn Inzendingen
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {worksheet.title}
          </h1>
          {worksheet.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {worksheet.description}
            </p>
          )}
        </div>

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Dit werkblad bevat nog geen vragen.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task, index) => (
              <TaskInput
                key={task.id}
                task={task}
                index={index}
                answer={answers[task.id]}
                onAnswerChange={(answer) => handleAnswerChange(task.id, answer)}
              />
            ))}
          </div>
        )}

        {/* Submit Button */}
        {tasks.length > 0 && (
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => router.push('/student-submissions')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-colors",
                submitting
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {submitting ? 'Bezig met inleveren...' : 'Inleveren'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Task Input Component for interactive answering
function TaskInput({
  task,
  index,
  answer,
  onAnswerChange
}: {
  task: Task;
  index: number;
  answer: any;
  onAnswerChange: (answer: any) => void;
}) {
  const content = task.content as Record<string, unknown>;
  const title = String(content?.title || content?.question || 'Untitled Task');

  const renderTaskInput = () => {
    switch (task.task_type) {
      case 'multiple-choice':
        const mcOptions = content?.options as string[] || [];
        const selectedOptions = answer || [];

        return (
          <div className="mt-4 space-y-2">
            {mcOptions.map((option, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <label className="flex items-center cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(idx)}
                    onChange={(e) => {
                      const newAnswer = e.target.checked
                        ? [...selectedOptions, idx]
                        : selectedOptions.filter((i: number) => i !== idx);
                      onAnswerChange(newAnswer);
                    }}
                    className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );

      case 'single_choice':
        const scOptions = content?.options as string[] || [];
        const selectedOption = answer ?? null;

        return (
          <div className="mt-4 space-y-2">
            {scOptions.map((option, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <label className="flex items-center cursor-pointer w-full">
                  <input
                    type="radio"
                    checked={selectedOption === idx}
                    onChange={() => onAnswerChange(idx)}
                    className="mr-3 h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                    name={`task-${task.id}`}
                  />
                  <span className="text-gray-900 dark:text-white">{option}</span>
                </label>
              </div>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <div className="mt-4">
            <input
              type="text"
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type je antwoord hier..."
              className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>
        );

      case 'essay':
        return (
          <div className="mt-4">
            <textarea
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Schrijf je antwoord hier..."
              rows={8}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white resize-none"
            />
          </div>
        );

      case 'matching':
        const leftItems = content?.leftItems as string[] || [];
        const rightItems = content?.rightItems as string[] || [];
        const matches = answer || {};

        return (
          <div className="mt-4">
            <div className="space-y-3">
              {leftItems.map((leftItem, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 font-medium text-gray-900 dark:text-white">
                      {leftItem}
                    </div>
                    <span className="text-gray-400">→</span>
                    <select
                      value={matches[idx] ?? ''}
                      onChange={(e) => {
                        const newMatches = { ...matches, [idx]: parseInt(e.target.value) };
                        onAnswerChange(newMatches);
                      }}
                      className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    >
                      <option value="">Selecteer match...</option>
                      {rightItems.map((rightItem, ridx) => (
                        <option key={ridx} value={ridx}>{rightItem}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'ordering':
        const items = content?.items as string[] || [];
        const order = answer || [...Array(items.length).keys()];

        return (
          <div className="mt-4 space-y-2">
            {order.map((orderIdx: number, position: number) => (
              <div key={position} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 w-8">
                  {position + 1}.
                </span>
                <select
                  value={orderIdx}
                  onChange={(e) => {
                    const newOrder = [...order];
                    newOrder[position] = parseInt(e.target.value);
                    onAnswerChange(newOrder);
                  }}
                  className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  {items.map((item, idx) => (
                    <option key={idx} value={idx}>{item}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );

      case 'fill_gaps':
        // Fill in the gaps task - extract gaps from the text
        const gapText = content?.text as string || '';
        const gaps = content?.gaps as string[] || [];
        const gapAnswers = answer || {};

        return (
          <div className="mt-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {gapText}
              </p>
            </div>
            <div className="space-y-3">
              {gaps.map((gapLabel, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">
                    {gapLabel}:
                  </label>
                  <input
                    type="text"
                    value={gapAnswers[idx] || ''}
                    onChange={(e) => {
                      const newAnswers = { ...gapAnswers, [idx]: e.target.value };
                      onAnswerChange(newAnswers);
                    }}
                    placeholder="Vul in..."
                    className="flex-1 p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'open-question':
        // Open question - similar to essay but might have different grading
        return (
          <div className="mt-4">
            <textarea
              value={answer || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Schrijf je antwoord hier..."
              rows={6}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white resize-none"
            />
          </div>
        );

      case 'information':
        const infoText = content?.text as string || '';
        return (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{infoText}</p>
          </div>
        );

      default:
        return (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-300">
              Onbekend taaktype: {task.task_type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          {renderTaskInput()}
        </div>
      </div>
    </div>
  );
}
