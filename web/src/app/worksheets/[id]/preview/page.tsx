"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../utils/supabaseClient';
import { Worksheet, Task } from '../../../../types/database';
import { ArrowLeft, Printer, Edit } from 'lucide-react';

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
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                            <p style={{ color: '#dc2626', fontStyle: 'italic' }}>
                                No options found for this multiple choice question.
                            </p>
                        </div>
                    );
                }

                return (
                    <div style={{ marginTop: '1rem' }}>
                        {mcOptions.map((option, idx) => (
                            <div key={idx} style={{
                                padding: '0.5rem',
                                margin: '0.25rem 0',
                                backgroundColor: correctAnswers.includes(idx) ? '#dcfce7' : '#f9fafb',
                                borderRadius: '4px',
                                border: correctAnswers.includes(idx) ? '1px solid #16a34a' : '1px solid #e5e7eb'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        disabled
                                        checked={correctAnswers.includes(idx)}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    {option}
                                    {correctAnswers.includes(idx) && (
                                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>
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
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                            <p style={{ color: '#dc2626', fontStyle: 'italic' }}>
                                No options found for this single choice question.
                            </p>
                        </div>
                    );
                }

                return (
                    <div style={{ marginTop: '1rem' }}>
                        {scOptions.map((option, idx) => (
                            <div key={idx} style={{
                                padding: '0.5rem',
                                margin: '0.25rem 0',
                                backgroundColor: correctAnswer === idx ? '#dcfce7' : '#f9fafb',
                                borderRadius: '4px',
                                border: correctAnswer === idx ? '1px solid #16a34a' : '1px solid #e5e7eb'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        disabled
                                        checked={correctAnswer === idx}
                                        style={{ marginRight: '0.5rem' }}
                                        name={`task-${task.id}`}
                                    />
                                    {option}
                                    {correctAnswer === idx && (
                                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>
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
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            minHeight: '60px',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#6b7280',
                            fontStyle: 'italic'
                        }}>
                            [Short answer input field]
                        </div>
                        {expectedAnswers.length > 0 && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                                    Expected answers: {expectedAnswers.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'essay':
                return (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            minHeight: '150px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            color: '#6b7280',
                            fontStyle: 'italic'
                        }}>
                            <div style={{ paddingTop: '0.5rem' }}>
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
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                            <p style={{ color: '#dc2626', fontStyle: 'italic' }}>
                                No matching items found.
                            </p>
                        </div>
                    );
                }

                return (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                    Match these:
                                </h4>
                                {leftItems.length > 0 ? leftItems.map((item, idx) => (
                                    <div key={idx} style={{
                                        padding: '0.5rem',
                                        margin: '0.25rem 0',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '4px',
                                        border: '1px solid #d1d5db'
                                    }}>
                                        {String.fromCharCode(65 + idx)}. {item}
                                    </div>
                                )) : (
                                    <p style={{ color: '#dc2626', fontStyle: 'italic' }}>No left items found</p>
                                )}
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                    With these:
                                </h4>
                                {rightItems.length > 0 ? rightItems.map((item, idx) => (
                                    <div key={idx} style={{
                                        padding: '0.5rem',
                                        margin: '0.25rem 0',
                                        backgroundColor: correctMatches.includes(idx) ? '#dcfce7' : '#f3f4f6',
                                        borderRadius: '4px',
                                        border: correctMatches.includes(idx) ? '1px solid #16a34a' : '1px solid #d1d5db'
                                    }}>
                                        {idx + 1}. {item}
                                        {correctMatches.includes(idx) && (
                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                )) : (
                                    <p style={{ color: '#dc2626', fontStyle: 'italic' }}>No right items found</p>
                                )}
                            </div>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                                Drag items from the left to match with items on the right
                            </p>
                        </div>
                    </div>
                );

            case 'fill_gaps':
                const textWithGaps = content?.textWithGaps as string || '';

                if (!textWithGaps) {
                    return (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                            <p style={{ color: '#dc2626', fontStyle: 'italic' }}>
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
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            lineHeight: '1.6',
                            fontSize: '1rem'
                        }}>
                            {renderTextWithGaps()}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
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
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px' }}>
                            <p style={{ color: '#dc2626', fontStyle: 'italic' }}>
                                No items found for this ordering task.
                            </p>
                        </div>
                    );
                }

                return (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '8px',
                            border: '1px solid #bae6fd',
                            marginBottom: '1rem'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '0.5rem' }}>
                                <strong>Task:</strong> Drag and drop the items below into the correct order.
                            </p>
                            {correctOrder.length > 0 && (
                                <p style={{ fontSize: '0.75rem', color: '#0c4a6e', fontStyle: 'italic' }}>
                                    Correct order: {correctOrder.map((idx, pos) => `${pos + 1}. ${items[idx]}`).join(' → ')}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {items.map((item, idx) => (
                                <div key={idx} style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '4px',
                                    border: '1px solid #d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'move'
                                }}>
                                    <span style={{ marginRight: '0.75rem', fontSize: '1.25rem', color: '#9ca3af' }}>⋮⋮</span>
                                    <span>{idx + 1}. {item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'information':
                const informationText = content?.question as string || content?.text as string || '';

                return (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            padding: '1.5rem',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #86efac',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ color: '#15803d', fontSize: '1rem' }}>
                                {informationText || <em style={{ color: '#9ca3af' }}>No information text provided.</em>}
                            </div>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                                ℹ️ This is an informational block - no answer required.
                            </p>
                        </div>
                    </div>
                );

            case 'open-question':
            default:
                return (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db',
                            minHeight: '120px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            color: '#6b7280',
                            fontStyle: 'italic'
                        }}>
                            <div style={{ paddingTop: '0.5rem' }}>
                                [Open question - students can provide detailed written answers here]
                                {task.task_type && task.task_type !== 'open-question' && (
                                    <div style={{ marginTop: '0.5rem', color: '#dc2626', fontSize: '0.75rem' }}>
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
        <div style={{
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '1rem',
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
            <p style={{
                fontWeight: '600',
                color: '#111827',
                fontSize: '1.125rem',
                marginBottom: '0.75rem'
            }}>
                {index + 1}. {title}
            </p>
            {(() => {
                const description = content?.description;
                if (description && typeof description === 'string') {
                    return (
                        <p style={{
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            marginBottom: '0.75rem',
                            lineHeight: '1.5'
                        }}>
                            {description}
                        </p>
                    );
                }
                return null;
            })()}
            <div style={{
                marginTop: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem'
            }}>
                <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                }}>
                    {task.task_type?.replace(/[-_]/g, ' ') || 'Task'}
                </span>
                {(content?.points as number) && (
                    <span style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#6b7280'
                    }}>
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
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    Loading worksheet preview...
                </div>
            </div>
        );
    }

    if (error || !worksheet) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f8fafc'
            }}>
                <div style={{
                    padding: '2rem',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <p style={{ color: '#dc2626', fontSize: '1.125rem', fontWeight: '600' }}>
                        {error || 'Worksheet not found.'}
                    </p>
                    <Link
                        href="/worksheets"
                        style={{
                            display: 'inline-block',
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        Back to Worksheets
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <header style={{
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{
                    maxWidth: '1024px',
                    margin: '0 auto',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                        onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                    >
                        <ArrowLeft style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                        Back
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                color: '#374151',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'white'}
                        >
                            <Printer style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                            Print
                        </button>
                        <Link
                            href={`/worksheets/${id}/edit`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                        >
                            <Edit style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                            Edit Worksheet
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{
                maxWidth: '1024px',
                margin: '0 auto',
                padding: '2rem 1rem'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    marginBottom: '2rem'
                }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#111827',
                        borderBottom: '1px solid #e5e7eb',
                        paddingBottom: '1rem',
                        marginBottom: '1rem'
                    }}>
                        {worksheet.title}
                    </h1>
                    {worksheet.description && (
                        <p style={{
                            fontSize: '1rem',
                            color: '#6b7280',
                            marginBottom: '1rem',
                            lineHeight: '1.6'
                        }}>
                            {worksheet.description}
                        </p>
                    )}
                    {worksheet.instructions && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe'
                        }}>
                            <h3 style={{
                                fontWeight: '600',
                                color: '#1e40af',
                                marginBottom: '0.5rem'
                            }}>
                                Instructions
                            </h3>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#1e3a8a',
                                lineHeight: '1.5'
                            }}>
                                {worksheet.instructions}
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: '1.5rem'
                    }}>
                        Tasks ({tasks.length})
                    </h2>
                    {tasks.length > 0 ? (
                        tasks.map((task, index) => <TaskRenderer key={task.id} task={task} index={index} />)
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            border: '2px dashed #d1d5db'
                        }}>
                            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                                This worksheet doesn&apos;t have any tasks yet.
                            </p>
                            <Link
                                href={`/worksheets/${id}/edit?tab=add-tasks`}
                                style={{
                                    display: 'inline-block',
                                    marginTop: '1rem',
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                Add Tasks
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
