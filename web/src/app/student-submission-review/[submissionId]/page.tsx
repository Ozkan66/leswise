"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { Worksheet, Task, Submission } from '@/types/database';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentSubmissionReviewPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const submissionId = params.submissionId as string;

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && submissionId) {
            fetchSubmissionData();
        }
    }, [submissionId, user]);

    const fetchSubmissionData = async () => {
        if (!user || !submissionId) return;

        try {
            setLoading(true);

            // Fetch submission
            const { data: subData, error: subError } = await supabase
                .from('submissions')
                .select('*')
                .eq('id', submissionId)
                .single();

            if (subError || !subData) throw new Error('Submission not found');
            setSubmission(subData);

            // Fetch worksheet
            const { data: wsData, error: wsError } = await supabase
                .from('worksheets')
                .select('*')
                .eq('id', subData.worksheet_id)
                .single();

            if (wsError || !wsData) throw new Error('Worksheet not found');
            setWorksheet(wsData);

            // Fetch tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('worksheet_id', subData.worksheet_id)
                .order('order_index', { ascending: true });

            if (tasksError) throw tasksError;
            setTasks(tasksData || []);

        } catch (err) {
            console.error('Error fetching submission:', err);
            setError(err instanceof Error ? err.message : 'Failed to load submission');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <p>Loading...</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error || !submission || !worksheet) {
        return (
            <AuthenticatedLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <p className="text-red-600">{error || 'Submission not found'}</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    const answers = submission.answers || {};
    const feedbackData = submission.feedback_data || {};

    // Calculate total score
    const totalScore = submission.score || 0;
    const maxScore = tasks.reduce((sum, t) => sum + (t.content?.points as number || 1), 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => router.push('/student-submissions')}
                        className="mb-6 px-4 py-2 text-blue-600 hover:text-blue-800"
                    >
                        ← Terug naar mijn werkbladen
                    </button>

                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {worksheet.title}
                        </h1>
                        {worksheet.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {worksheet.description}
                            </p>
                        )}

                        {/* Score Summary */}
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                Jouw score: {totalScore} / {maxScore} ({percentage}%)
                            </p>
                            {submission.feedback && (
                                <p className="mt-2 text-gray-700 dark:text-gray-300">
                                    {submission.feedback}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Questions with Answers and Feedback */}
                    <div className="space-y-6">
                        {tasks.map((task, index) => {
                            const taskAnswer = answers[task.id];
                            const taskFeedback = feedbackData[task.id];
                            const content = task.content as Record<string, any>;
                            const questionText = content?.question || content?.title || 'Vraag';
                            const maxPoints = content?.points || 1;

                            return (
                                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {questionText}
                                            </h3>

                                            {/* Student's Answer */}
                                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    Jouw antwoord:
                                                </p>
                                                <p className="text-gray-900 dark:text-white">
                                                    {taskAnswer ? (
                                                        typeof taskAnswer === 'object' ? JSON.stringify(taskAnswer) : String(taskAnswer)
                                                    ) : (
                                                        <em className="text-gray-400">Geen antwoord gegeven</em>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Feedback */}
                                            {taskFeedback && (
                                                <div className="mt-4">
                                                    {taskFeedback.score !== undefined && (
                                                        <div className="mb-2">
                                                            <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                                                                Score: {taskFeedback.score} / {maxPoints}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {taskFeedback.feedback && (
                                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Feedback van docent:
                                                            </p>
                                                            <p className="text-gray-700 dark:text-gray-300">
                                                                {taskFeedback.feedback}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
