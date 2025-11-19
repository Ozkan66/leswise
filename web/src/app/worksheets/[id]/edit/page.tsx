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
import AuthenticatedLayout from '../../../../components/AuthenticatedLayout';
import { cn } from '@/lib/utils';

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
        <div className="w-full">
            {/* Tab Headers */}
            <div className="grid grid-cols-4 bg-muted rounded-lg p-1">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all",
                                activeTab === tab.id
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted-foreground/10"
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="bg-card rounded-lg border border-border mt-4 shadow-sm">
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
                )}
                {activeTab === 'add-tasks' && (
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
    <div className="p-6 space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-foreground">Worksheet Editor</h3>
            <p className="text-sm text-muted-foreground mt-2">
                Here you can edit the main content and structure of your worksheet.
            </p>
        </div>

        <div className="space-y-4">
            <div>
                <label htmlFor="worksheet-title" className="block text-sm font-medium text-foreground mb-2">Title</label>
                <input
                    id="worksheet-title"
                    value={worksheet?.title || ''}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter worksheet title"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
            </div>
            <div>
                <label htmlFor="worksheet-description" className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                    id="worksheet-description"
                    value={worksheet?.description || ''}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Enter worksheet description"
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-y"
                />
            </div>
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
    <div className="p-6 space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-foreground">Settings</h3>
            <p className="text-sm text-muted-foreground mt-2">
                Configure worksheet settings, like status and folder.
            </p>
        </div>

        <div>
            <label htmlFor="worksheet-status" className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
                id="worksheet-status"
                value={worksheet?.status || 'draft'}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
            >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
            </select>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium text-foreground m-0">Worksheet Information</h4>
            <div className="mt-2 text-sm text-muted-foreground space-y-1">
                <p><strong>Created:</strong> {worksheet?.created_at ? new Date(worksheet.created_at).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>Last updated:</strong> {worksheet?.updated_at ? new Date(worksheet.updated_at).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>ID:</strong> {worksheet?.id}</p>
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
        <div className="p-6 space-y-8">
            {/* Quick Add Task Button */}
            <div className="p-6 bg-muted/30 border-2 border-dashed border-border rounded-lg text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    Choose how you want to add tasks
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Use the visual selector for a better experience, or the quick form below
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link
                        href={`/worksheets/add-task?worksheet=${worksheetId}`}
                        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Choose Task Type
                    </Link>
                    <button
                        onClick={() => setShowAIGenerator(true)}
                        className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                        🤖 Generate with AI
                    </button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">or use quick form below</div>
            </div>

            {/* Show Advanced Form Button */}
            {!showAdvancedForm && !newTaskType && (
                <div className="text-center">
                    <button
                        onClick={() => setShowAdvancedForm(true)}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                        ✏️ Create Detailed Task
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Quick Add Task</h3>
                    <CreateTaskForm
                        worksheetId={worksheetId}
                        onTaskCreated={onTaskAdded}
                        existingTasksCount={tasks.length}
                        initialTaskType={newTaskType}
                        onShowNotification={showNotification}
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Current Tasks ({tasks.length})</h3>
                    <div className="space-y-4">
                        {tasks.length > 0 ? tasks.map(task => (
                            <div key={task.id} className="p-4 border border-border rounded-lg bg-card flex justify-between items-center shadow-sm">
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="font-semibold text-foreground truncate">
                                        {(task.order_index || 0) + 1}. {
                                            task.title ||
                                            ((task.content as Record<string, unknown>)?.title as string) ||
                                            ((task.content as Record<string, unknown>)?.question as string) ||
                                            'Untitled Task'
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground capitalize mt-1">
                                        {task.task_type?.replace(/[-_]/g, ' ') || 'Task'}
                                    </p>
                                    {((task.content as Record<string, unknown>)?.description as string) && (
                                        <p className="text-xs text-muted-foreground mt-1 italic truncate">
                                            {String((task.content as Record<string, unknown>).description)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        onClick={() => handleEditTask(task)}
                                        className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                        title="Edit task"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDelete(task.id);
                                        }}
                                        className="p-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                                        title="Delete task"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-lg bg-muted/30">
                                <p className="text-sm">No tasks added yet.</p>
                                <p className="text-xs mt-2 text-muted-foreground">
                                    Click &quot;Choose Task Type&quot; above to add your first task.
                                </p>
                            </div>
                        )}
                    </div>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-background rounded-lg p-8 max-w-md w-[90%] shadow-xl border border-border">
                        <h3 className="text-xl font-semibold text-foreground mb-4">
                            Delete Task
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-input rounded-md bg-background text-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
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
    <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground">Results & Submissions</h3>
        <p className="text-sm text-muted-foreground mt-2">
            View student submissions and analytics for this worksheet.
        </p>
        <div className="mt-6 text-center text-muted-foreground p-8 border-2 border-dashed border-border rounded-lg bg-muted/30">
            <p className="m-0">Results will be shown here once students complete the worksheet.</p>
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
        return (
            <AuthenticatedLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error) {
        return (
            <AuthenticatedLayout>
                <div className="p-8 text-center text-destructive h-screen flex items-center justify-center">{error}</div>
            </AuthenticatedLayout>
        );
    }

    if (!worksheet) {
        return (
            <AuthenticatedLayout>
                <div className="p-8 text-center h-screen flex items-center justify-center">Worksheet not found.</div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-background">
                <header className="bg-card border-b border-border sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <button
                                onClick={() => router.push('/worksheets')}
                                className="inline-flex items-center px-4 py-2 bg-transparent text-foreground border border-input rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Worksheets
                            </button>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold text-foreground flex items-center" title={worksheet.title}>
                                    {worksheet.title}
                                </h1>
                                {hasUnsavedChanges && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                        Unsaved changes
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/worksheets/${worksheet.id}/preview`}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-transparent text-foreground border border-input rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                >
                                    Preview
                                </Link>
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={!hasUnsavedChanges || saving}
                                    className={cn(
                                        "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        hasUnsavedChanges
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                                    )}
                                >
                                    {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </AuthenticatedLayout>
    );
}
