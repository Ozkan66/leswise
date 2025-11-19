"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../utils/supabaseClient';
import { Worksheet, Task } from '../../../../types/database';
import { ArrowLeft, Printer, Edit } from 'lucide-react';
import AuthenticatedLayout from '../../../../components/AuthenticatedLayout';
import { cn } from '@/lib/utils';

// This component will render a single task based on its type with proper previews
const TaskRenderer = ({ task, index }: { task: Task; index: number }) => {
    const content = task.content as Record<string, unknown>;
    const title = String(content?.title || content?.question || 'Untitled Task');

    const renderTaskContent = () => {
        switch (task.task_type) {
            case 'multiple-choice':
                const mcOptions = content?.options as string[] || [];
                const correctAnswers = content?.correctAnswers as number[] || [];

                if (mcOptions.length === 0) {
                    return (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 italic">
                                No options found for this multiple choice question.
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="mt-4 space-y-2">
                        {mcOptions.map((option, idx) => (
                            <div key={idx} className={cn(
                                "p-2 rounded-md border flex items-center",
                                correctAnswers.includes(idx)
                                    ? "bg-green-50 border-green-500"
                                    : "bg-card border-border"
                            )}>
                                <label className="flex items-center cursor-pointer w-full">
                                    <input
                                        type="checkbox"
                                        disabled
                                        checked={correctAnswers.includes(idx)}
                                        className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-foreground">{option}</span>
                                    {correctAnswers.includes(idx) && (
                                        <span className="ml-auto text-xs text-green-600 font-semibold">
                                            ✓ Correct
                                        </span>
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'single_choice':
                const scOptions = content?.options as string[] || [];
                const correctAnswer = content?.correctAnswer as number;

                if (scOptions.length === 0) {
                    return (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 italic">
                                No options found for this single choice question.
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="mt-4 space-y-2">
                        {scOptions.map((option, idx) => (
                            <div key={idx} className={cn(
                                "p-2 rounded-md border flex items-center",
                                correctAnswer === idx
                                    ? "bg-green-50 border-green-500"
                                    : "bg-card border-border"
                            )}>
                                <label className="flex items-center cursor-pointer w-full">
                                    <input
                                        type="radio"
                                        disabled
                                        checked={correctAnswer === idx}
                                        className="mr-2 h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                                        name={`task-${task.id}`}
                                    />
                                    <span className="text-foreground">{option}</span>
                                    {correctAnswer === idx && (
                                        <span className="ml-auto text-xs text-green-600 font-semibold">
                                            ✓ Correct
                                        </span>
                                    )}
                                </label>
                            </div>
                        ))}
                    </div>
                );

            case 'short_answer':
                const expectedAnswers = content?.expectedAnswers as string[] || [];
                return (
                    <div className="mt-4">
                        <div className="p-3 bg-muted/30 rounded-md border border-input min-h-[60px] flex items-center text-muted-foreground italic">
                            [Short answer input field]
                        </div>
                        {expectedAnswers.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs text-muted-foreground italic">
                                    Expected answers: {expectedAnswers.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'essay':
                return (
                    <div className="mt-4">
                        <div className="p-4 bg-muted/30 rounded-md border border-input min-h-[150px] flex items-start text-muted-foreground italic">
                            <div className="pt-2">
                                [Long text essay area - students can write extended responses here]
                            </div>
                        </div>
                    </div>
                );

            case 'matching':
                const leftItems = content?.leftItems as string[] || [];
                const rightItems = content?.rightItems as string[] || [];
                const correctMatches = content?.correctMatches as number[] || [];

                if (leftItems.length === 0 && rightItems.length === 0) {
                    return (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 italic">
                                No matching items found.
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-foreground">
                                    Match these:
                                </h4>
                                {leftItems.length > 0 ? leftItems.map((item, idx) => (
                                    <div key={idx} className="p-2 my-1 bg-muted rounded-md border border-border text-foreground">
                                        {String.fromCharCode(65 + idx)}. {item}
                                    </div>
                                )) : (
                                    <p className="text-red-600 italic">No left items found</p>
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-2 text-foreground">
                                    With these:
                                </h4>
                                {rightItems.length > 0 ? rightItems.map((item, idx) => (
                                    <div key={idx} className={cn(
                                        "p-2 my-1 rounded-md border flex items-center",
                                        correctMatches.includes(idx)
                                            ? "bg-green-50 border-green-500"
                                            : "bg-muted border-border"
                                    )}>
                                        <span className="text-foreground">{idx + 1}. {item}</span>
                                        {correctMatches.includes(idx) && (
                                            <span className="ml-2 text-xs text-green-600 font-bold">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-red-600 italic">No right items found</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground italic">
                                Drag items from the left to match with items on the right
                            </p>
                        </div>
                    </div>
                );

            case 'fill_gaps':
                const textWithGaps = content?.textWithGaps as string || '';

                if (!textWithGaps) {
                    return (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 italic">
                                No text found for this fill-gaps task.
                            </p>
                        </div>
                    );
                }

                // Replace [gap] markers with visible gap placeholders
                const renderTextWithGaps = () => {
                    let gapNumber = 1;
                    return textWithGaps.replace(/\[gap\]/g, () => {
                        const placeholder = `[___ ${gapNumber} ___]`;
                        gapNumber++;
                        return placeholder;
                    });
                };

                return (
                    <div className="mt-4">
                        <div className="p-4 bg-muted/30 rounded-md border border-input leading-relaxed text-base text-foreground">
                            {renderTextWithGaps()}
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground italic">
                                Students will fill in the gaps marked with [___ # ___]
                            </p>
                        </div>
                    </div>
                );

            case 'ordering':
                const items = content?.items as string[] || [];
                const correctOrder = content?.correctOrder as number[] || [];

                if (items.length === 0) {
                    return (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 italic">
                                No items found for this ordering task.
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="mt-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                <strong>Task:</strong> Drag and drop the items below into the correct order.
                            </p>
                            {correctOrder.length > 0 && (
                                <p className="text-xs text-blue-800 dark:text-blue-200 italic">
                                    Correct order: {correctOrder.map((idx, pos) => `${pos + 1}. ${items[idx]}`).join(' → ')}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="p-3 bg-card rounded-md border border-border flex items-center cursor-move shadow-sm hover:shadow-md transition-shadow">
                                    <span className="mr-3 text-xl text-muted-foreground">⋮⋮</span>
                                    <span className="text-foreground">{idx + 1}. {item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'information':
                const informationText = content?.question as string || content?.text as string || '';

                return (
                    <div className="mt-4">
                        <div className="p-6 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 leading-relaxed">
                            <div className="text-green-800 dark:text-green-300 text-base">
                                {informationText || <em className="text-muted-foreground">No information text provided.</em>}
                            </div>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground italic">
                                ℹ️ This is an informational block - no answer required.
                            </p>
                        </div>
                    </div>
                );

            case 'open-question':
            default:
                return (
                    <div className="mt-4">
                        <div className="p-4 bg-muted/30 rounded-md border border-input min-h-[120px] flex items-start text-muted-foreground italic">
                            <div className="pt-2">
                                [Open question - students can provide detailed written answers here]
                                {task.task_type && task.task_type !== 'open-question' && (
                                    <div className="mt-2 text-destructive text-xs">
                                        Warning: Unknown task type &quot;{task.task_type}&quot; - falling back to open question display
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="p-6 border border-border rounded-lg mb-4 bg-card shadow-sm">
            <p className="font-semibold text-foreground text-lg mb-3">
                {index + 1}. {title}
            </p>
            {(() => {
                const description = content?.description;
                if (description && typeof description === 'string') {
                    return (
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                            {description}
                        </p>
                    );
                }
                return null;
            })()}
            <div className="mt-2 text-foreground text-sm flex items-center">
                <span className="inline-block px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium capitalize">
                    {task.task_type?.replace(/[-_]/g, ' ') || 'Task'}
                </span>
                {(content?.points as number) && (
                    <span className="ml-2 text-xs text-muted-foreground">
                        ({content.points as number} {(content.points as number) === 1 ? 'point' : 'points'})
                    </span>
                )}
            </div>
            {renderTaskContent()}
        </div>
    );
};

export default function PreviewWorksheetPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchWorksheetData = async () => {
            setLoading(true);

            const { data: worksheetData, error: worksheetError } = await supabase
                .from('worksheets')
                .select('*')
                .eq('id', id)
                .single();

            if (worksheetError) {
                setError('Failed to load worksheet.');
                console.error(worksheetError);
            } else {
                setWorksheet(worksheetData);
            }

            // Fetch tasks from the correct table
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('worksheet_id', id)
                .order('order_index', { ascending: true });

            if (tasksError) {
                console.error("Error fetching worksheet elements:", tasksError);
            } else {
                setTasks(tasksData || []);
            }

            setLoading(false);
        };

        fetchWorksheetData();
    }, [id]);

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center min-h-screen bg-muted/30">
                    <div className="p-8 bg-card rounded-lg shadow-sm text-center">
                        Loading worksheet preview...
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error || !worksheet) {
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center min-h-screen bg-muted/30">
                    <div className="p-8 bg-card rounded-lg shadow-sm text-center">
                        <p className="text-destructive text-lg font-semibold">
                            {error || 'Worksheet not found.'}
                        </p>
                        <Link
                            href="/worksheets"
                            className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Back to Worksheets
                        </Link>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-muted/30">
                <header className="bg-card shadow-sm sticky top-0 z-10 border-b border-border print:hidden">
                    <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center px-4 py-2 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground rounded-md text-sm font-medium transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center px-4 py-2 bg-card border border-input text-foreground hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </button>
                            <Link
                                href={`/worksheets/${id}/edit`}
                                className="flex items-center px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Worksheet
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
                    <div className="bg-card p-8 rounded-lg shadow-sm mb-8 border border-border print:shadow-none print:border-none">
                        <h1 className="text-3xl font-bold text-foreground border-b border-border pb-4 mb-4">
                            {worksheet.title}
                        </h1>
                        {worksheet.description && (
                            <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                                {worksheet.description}
                            </p>
                        )}
                        {worksheet.instructions && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                    Instructions
                                </h3>
                                <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                                    {worksheet.instructions}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-6 print:hidden">
                            Tasks ({tasks.length})
                        </h2>
                        {tasks.length > 0 ? (
                            tasks.map((task, index) => <TaskRenderer key={task.id} task={task} index={index} />)
                        ) : (
                            <div className="text-center p-12 bg-card rounded-lg border-2 border-dashed border-border">
                                <p className="text-muted-foreground text-lg">
                                    This worksheet doesn&apos;t have any tasks yet.
                                </p>
                                <Link
                                    href={`/worksheets/${id}/edit?tab=add-tasks`}
                                    className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                                >
                                    Add Tasks
                                </Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
