"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../utils/supabaseClient';
import { Worksheet, Task } from '../../../../types/database';
import { ArrowLeft, Settings, PlusCircle, BarChart2, Trash2, Edit3 } from 'lucide-react';
import { CreateTaskForm } from '@/components/CreateTaskForm';
import { AdvancedTaskForm } from '@/components/AdvancedTaskForm';
import { AIGenerator } from '../../../../components/AIGenerator';
import { NotificationModal } from '../../../../components/NotificationModal';

// Custom tabs component with inline styles
const CustomTabs = ({
    worksheet,
    worksheetId,
    tasks,
    onTitleChange,
    onDescriptionChange,
    onStatusChange,
    onTaskAdded,
    onTaskDeleted,
    initialTab = 'editor',
    newTaskType = null
}: {
    worksheet: Worksheet | null;
    worksheetId: string;
    tasks: Task[];
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
    onStatusChange: (status: string) => void;
    onTaskAdded: (task: Task) => void;
    onTaskDeleted: (taskId: string) => void;
    initialTab?: string;
    newTaskType?: string | null;
}) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    const tabs = [
        { id: 'editor', label: 'Editor', icon: Settings },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'add-tasks', label: 'Add Tasks', icon: PlusCircle },
        { id: 'results', label: 'Results', icon: BarChart2 }
    ];

    return (
        <div style={{ width: '100%' }}>
            {/* Tab Headers */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                padding: '4px'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 16px',
                                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                                color: activeTab === tab.id ? '#111827' : '#6b7280',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: activeTab === tab.id ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none'
                            }}
                            onMouseOver={(e) => {
                                if (activeTab !== tab.id) {
                                    (e.target as HTMLElement).style.backgroundColor = '#d1d5db';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (activeTab !== tab.id) {
                                    (e.target as HTMLElement).style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <Icon style={{ marginRight: '8px', height: '1rem', width: '1rem' }} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginTop: '16px'
            }}>
                {activeTab === 'editor' && (
                    <EditorTab
                        worksheet={worksheet}
                        onTitleChange={onTitleChange}
                        onDescriptionChange={onDescriptionChange}
                    />
                )}
                {activeTab === 'settings' && (
                    <SettingsTab
                        worksheet={worksheet}
                        onStatusChange={onStatusChange}
                    />
                )}                {activeTab === 'add-tasks' && (
                    <AddTasksTab
                        worksheetId={worksheetId}
                        tasks={tasks}
                        onTaskAdded={onTaskAdded}
                        onTaskDeleted={onTaskDeleted}
                        newTaskType={newTaskType}
                    />
                )}
                {activeTab === 'results' && (
                    <ResultsTab />
                )}
            </div>
        </div>
    );
};

// Functional components for tab content
const EditorTab = ({
    worksheet,
    onTitleChange,
    onDescriptionChange
}: {
    worksheet: Worksheet | null;
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
}) => (
    <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Worksheet Editor</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>
            Here you can edit the main content and structure of your worksheet.
        </p>
        <div style={{ marginTop: '24px' }}>
            <label htmlFor="worksheet-title" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
            }}>Title</label>
            <input
                id="worksheet-title"
                value={worksheet?.title || ''}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Enter worksheet title"
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
        </div>
        <div style={{ marginTop: '16px' }}>
            <label htmlFor="worksheet-description" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
            }}>Description</label>
            <textarea
                id="worksheet-description"
                value={worksheet?.description || ''}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Enter worksheet description"
                rows={4}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
        </div>
    </div>
);

const SettingsTab = ({
    worksheet,
    onStatusChange,
}: {
    worksheet: Worksheet | null;
    onStatusChange: (status: string) => void;
}) => (
    <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Settings</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>
            Configure worksheet settings, like status and folder.
        </p>
        <div style={{ marginTop: '24px' }}>
            <label htmlFor="worksheet-status" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '4px'
            }}>Status</label>
            <select
                id="worksheet-status"
                value={worksheet?.status || 'draft'}
                onChange={(e) => onStatusChange(e.target.value)}
                style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
            </select>
        </div>
        <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
        }}>
            <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                margin: 0
            }}>Worksheet Information</h4>
            <div style={{
                marginTop: '8px',
                fontSize: '0.875rem',
                color: '#6b7280'
            }}>
                <p style={{ margin: '4px 0' }}><strong>Created:</strong> {worksheet?.created_at ? new Date(worksheet.created_at).toLocaleDateString() : 'Unknown'}</p>
                <p style={{ margin: '4px 0' }}><strong>Last updated:</strong> {worksheet?.updated_at ? new Date(worksheet.updated_at).toLocaleDateString() : 'Unknown'}</p>
                <p style={{ margin: '4px 0' }}><strong>ID:</strong> {worksheet?.id}</p>
            </div>
        </div>
    </div>
);

const AddTasksTab = ({
    worksheetId,
    tasks,
    onTaskAdded,
    onTaskDeleted,
    newTaskType = null
}: {
    worksheetId: string,
    tasks: Task[],
    onTaskAdded: (task: Task) => void,
    onTaskDeleted: (taskId: string) => void,
    newTaskType?: string | null
}) => {
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [showAdvancedForm, setShowAdvancedForm] = useState(!!newTaskType);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; taskId: string | null }>({
        show: false,
        taskId: null
    });
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const handleDelete = async (taskId: string) => {
        // Show custom confirmation modal instead of window.confirm
        setDeleteConfirmation({ show: true, taskId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation.taskId) return;

        const { error } = await supabase.from('tasks').delete().eq('id', deleteConfirmation.taskId);

        if (error) {
            alert("Could not delete the task.");
            console.error(error);
        } else {
            // Call onTaskDeleted first to update state
            onTaskDeleted(deleteConfirmation.taskId);
            // Close confirmation modal
            setDeleteConfirmation({ show: false, taskId: null });
            // Then show notification after state update
            setTimeout(() => {
                setNotification({
                    show: true,
                    message: 'Task deleted successfully!',
                    type: 'success'
                });
            }, 100);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, taskId: null });
    };

    const handleAITasksGenerated = (generatedTasks: Task[]) => {
        // Add all generated tasks
        generatedTasks.forEach(task => onTaskAdded(task));
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setShowAdvancedForm(false); // Hide new task form if open
    };

    const handleUpdateTask = async (updatedTask: Task) => {
        // Update the task in the parent state
        setEditingTask(null);
        // Use setTimeout to allow UI to update smoothly
        setTimeout(() => {
            onTaskAdded(updatedTask); // This will trigger a re-render
        }, 1500);
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({
            show: true,
            message,
            type
        });
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Quick Add Task Button */}
            <div style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '0.5rem'
                }}>
                    Choose how you want to add tasks
                </h3>
                <p style={{
                    color: '#6b7280',
                    marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    Use the visual selector for a better experience, or the quick form below
                </p>
                <Link
                    href={`/worksheets/add-task?worksheet=${worksheetId}`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '12px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        marginRight: '1rem'
                    }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                >
                    <PlusCircle style={{ marginRight: '8px', height: '1rem', width: '1rem' }} />
                    Choose Task Type
                </Link>
                <button
                    onClick={() => setShowAIGenerator(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '12px 24px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#047857'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#059669'}
                >
                    🤖 Generate with AI
                </button>
                <span style={{ color: '#9ca3af' }}>or use quick form below</span>
            </div>

            {/* Show Advanced Form Button */}
            {!showAdvancedForm && !newTaskType && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <button
                        onClick={() => setShowAdvancedForm(true)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#4f46e5'}
                        onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#6366f1'}
                    >
                        ✏️ Create Detailed Task
                    </button>
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Quick Add Task</h3>
                    <CreateTaskForm
                        worksheetId={worksheetId}
                        onTaskCreated={onTaskAdded}
                        existingTasksCount={tasks.length}
                        initialTaskType={newTaskType}
                        onShowNotification={showNotification}
                    />
                </div>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Current Tasks ({tasks.length})</h3>
                    {tasks.length > 0 ? tasks.map(task => (
                        <div key={task.id} style={{
                            padding: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: '600', margin: 0, color: '#111827' }}>
                                    {(task.order_index || 0) + 1}. {
                                        task.title ||
                                        ((task.content as Record<string, unknown>)?.title as string) ||
                                        ((task.content as Record<string, unknown>)?.question as string) ||
                                        'Untitled Task'
                                    }
                                </p>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    textTransform: 'capitalize',
                                    margin: '4px 0 0 0'
                                }}>{task.task_type?.replace(/[-_]/g, ' ') || 'Task'}</p>
                                {((task.content as Record<string, unknown>)?.description as string) && (
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#9ca3af',
                                        margin: '2px 0 0 0',
                                        fontStyle: 'italic'
                                    }}>
                                        {String((task.content as Record<string, unknown>).description).substring(0, 100)}
                                        {String((task.content as Record<string, unknown>).description).length > 100 ? '...' : ''}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleEditTask(task)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#1d4ed8'}
                                    onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                                >
                                    <Edit3 style={{ height: '1rem', width: '1rem' }} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDelete(task.id);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                        backgroundColor: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#b91c1c'}
                                    onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#dc2626'}
                                >
                                    <Trash2 style={{ height: '1rem', width: '1rem' }} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{
                            textAlign: 'center',
                            color: '#6b7280',
                            padding: '2rem',
                            border: '2px dashed #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: '#f9fafb'
                        }}>
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>No tasks added yet.</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                                Click &quot;Choose Task Type&quot; above to add your first task.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Advanced Task Form - Create or Edit Mode */}
            {(showAdvancedForm || newTaskType || editingTask) && (
                <AdvancedTaskForm
                    worksheetId={worksheetId}
                    onTaskCreated={(task) => {
                        if (editingTask) {
                            handleUpdateTask(task);
                        } else {
                            onTaskAdded(task);
                            setShowAdvancedForm(false);
                        }
                    }}
                    existingTasksCount={tasks.length}
                    initialTaskType={newTaskType}
                    editingTask={editingTask}
                    onCancel={() => {
                        setShowAdvancedForm(false);
                        setEditingTask(null);
                    }}
                />
            )}

            {/* AI Generator Modal */}
            {showAIGenerator && (
                <AIGenerator
                    worksheetId={worksheetId}
                    onTasksGenerated={handleAITasksGenerated}
                    onClose={() => setShowAIGenerator(false)}
                    onShowNotification={showNotification}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '1rem'
                        }}>
                            Delete Task
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '1.5rem'
                        }}>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.75rem'
                        }}>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            <NotificationModal
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ show: false, message: '', type: 'success' })}
            />
        </div>
    );
};

const ResultsTab = () => (
    <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>Results & Submissions</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>
            View student submissions and analytics for this worksheet.
        </p>
        <div style={{
            marginTop: '24px',
            textAlign: 'center',
            color: '#6b7280',
            padding: '2rem',
            border: '2px dashed #e5e7eb',
            borderRadius: '8px'
        }}>
            <p style={{ margin: 0 }}>Results will be shown here once students complete the worksheet.</p>
        </div>
    </div>
);


export default function EditWorksheetPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const router = useRouter();
    const [worksheet, setWorksheet] = useState<Worksheet | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track original values for change detection
    const [originalWorksheet, setOriginalWorksheet] = useState<Worksheet | null>(null);

    // Handle initial tab and new task flow
    const initialTab = searchParams.get('tab') || 'editor';
    const newTaskType = searchParams.get('newTask');

    const fetchWorksheetData = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError('You must be logged in to edit worksheets.');
            setLoading(false);
            return;
        }

        // Fetch worksheet
        const { data: worksheetData, error: worksheetError } = await supabase
            .from('worksheets')
            .select('*')
            .eq('id', id)
            .eq('owner_id', user.id)
            .single();

        if (worksheetError) {
            setError('Failed to load worksheet. It might not exist or you may not have access.');
            console.error(worksheetError);
            setWorksheet(null);
        } else {
            setWorksheet(worksheetData);
            setOriginalWorksheet(worksheetData);
        }

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('worksheet_id', id)
            .order('order_index', { ascending: true });

        if (tasksError) {
            console.error("Error fetching worksheet elements:", tasksError);
            setError('Failed to load tasks for this worksheet.');
        } else {
            console.log("Worksheet elements loaded successfully:", tasksData?.length || 0, "tasks");
            setTasks(tasksData || []);
        }

        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchWorksheetData();
    }, [fetchWorksheetData]);

    // Check for unsaved changes
    useEffect(() => {
        if (!originalWorksheet || !worksheet) return;

        const hasChanges =
            originalWorksheet.title !== worksheet.title ||
            originalWorksheet.description !== worksheet.description ||
            originalWorksheet.status !== worksheet.status;

        setHasUnsavedChanges(hasChanges);
    }, [worksheet, originalWorksheet]);

    const handleSaveChanges = async () => {
        if (!worksheet || !hasUnsavedChanges) return;

        setSaving(true);

        const { error } = await supabase
            .from('worksheets')
            .update({
                title: worksheet.title,
                description: worksheet.description,
                status: worksheet.status,
                folder_id: worksheet.folder_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', worksheet.id);

        if (error) {
            alert("Failed to save changes. Please try again.");
            console.error(error);
        } else {
            setOriginalWorksheet(worksheet);
            setHasUnsavedChanges(false);
            alert("Worksheet saved successfully!");
        }

        setSaving(false);
    };

    const handleTitleChange = (title: string) => {
        if (!worksheet) return;
        setWorksheet({ ...worksheet, title });
    };

    const handleDescriptionChange = (description: string) => {
        if (!worksheet) return;
        setWorksheet({ ...worksheet, description });
    };

    const handleStatusChange = (status: string) => {
        if (!worksheet) return;
        setWorksheet({ ...worksheet, status: status as 'draft' | 'published' });
    };

    const handleTaskAdded = (newTask: Task) => {
        setTasks(currentTasks => [...currentTasks, newTask].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    };

    const handleTaskDeleted = (taskId: string) => {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
    };

    if (loading) {
        return <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    if (error) {
        return <div style={{ padding: '2rem', color: '#ef4444', textAlign: 'center', height: '100vh' }}>{error}</div>;
    }

    if (!worksheet) {
        return <div style={{ padding: '2rem', textAlign: 'center', height: '100vh' }}>Worksheet not found.</div>;
    }

    return (
        <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{
                    maxWidth: '1280px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    padding: '0 1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0'
                    }}>
                        <button
                            onClick={() => router.push('/worksheets')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                        >
                            <ArrowLeft style={{ marginRight: '8px', height: '1rem', width: '1rem' }} />
                            Back to Worksheets
                        </button>
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            display: 'flex',
                            alignItems: 'center',
                            margin: 0
                        }} title={worksheet.title}>
                            {worksheet.title}
                            {hasUnsavedChanges && (
                                <span style={{
                                    marginLeft: '8px',
                                    padding: '4px 8px',
                                    fontSize: '0.75rem',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    borderRadius: '9999px'
                                }}>
                                    Unsaved changes
                                </span>
                            )}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link href={`/worksheets/${worksheet.id}/preview`} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                Preview
                            </Link>
                            <button
                                onClick={handleSaveChanges}
                                disabled={!hasUnsavedChanges || saving}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '8px 16px',
                                    backgroundColor: hasUnsavedChanges ? '#2563eb' : '#9ca3af',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: hasUnsavedChanges && !saving ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    opacity: (!hasUnsavedChanges || saving) ? 0.6 : 1
                                }}
                                onMouseOver={(e) => {
                                    if (hasUnsavedChanges && !saving) {
                                        (e.target as HTMLElement).style.backgroundColor = '#1d4ed8';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (hasUnsavedChanges && !saving) {
                                        (e.target as HTMLElement).style.backgroundColor = '#2563eb';
                                    }
                                }}
                            >
                                {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{
                maxWidth: '1280px',
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '2rem 1rem'
            }}>
                <CustomTabs
                    worksheet={worksheet}
                    worksheetId={id}
                    tasks={tasks}
                    onTitleChange={handleTitleChange}
                    onDescriptionChange={handleDescriptionChange}
                    onStatusChange={handleStatusChange}
                    onTaskAdded={handleTaskAdded}
                    onTaskDeleted={handleTaskDeleted}
                    initialTab={initialTab}
                    newTaskType={newTaskType}
                />
            </main>
        </div>
    );
}
