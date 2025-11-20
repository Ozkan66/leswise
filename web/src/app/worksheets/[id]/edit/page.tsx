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
    onTasksReordered,
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
    onTasksReordered: (tasks: Task[]) => void;
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
                        onTasksReordered={onTasksReordered}
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

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Sparkles, Plus } from "lucide-react";

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

// Sortable Task Item Component
const SortableTaskItem = ({
    task,
    index,
    onEdit,
    onDelete
}: {
    task: Task;
    index: number;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card
                className={`group hover:border-primary/50 transition-colors cursor-pointer ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
                onClick={() => onEdit(task)}
            >
                <div className="flex items-center p-4 gap-4">
                    <div
                        {...listeners}
                        className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground font-medium text-sm shrink-0">
                        {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs capitalize">
                                {task.task_type?.replace(/[-_]/g, ' ') || 'Task'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {(task.content as any)?.points || 1} pts
                            </span>
                        </div>
                        <h4 className="font-medium truncate">
                            {task.title || (task.content as any)?.question || 'Untitled Task'}
                        </h4>
                        {(task.content as any)?.description && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                                {(task.content as any).description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                        >
                            <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const AddTasksTab = ({
    worksheetId,
    tasks,
    onTaskAdded,
    onTaskDeleted,
    onTasksReordered,
    newTaskType = null
}: {
    worksheetId: string,
    tasks: Task[],
    onTaskAdded: (task: Task) => void,
    onTaskDeleted: (taskId: string) => void,
    onTasksReordered: (tasks: Task[]) => void,
    newTaskType?: string | null
}) => {
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [isTaskTypeSelectorOpen, setIsTaskTypeSelectorOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [activeNewTaskType, setActiveNewTaskType] = useState<string | null>(newTaskType);

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; taskId: string | null }>({
        show: false,
        taskId: null
    });
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Reset activeNewTaskType when prop changes
    useEffect(() => {
        if (newTaskType) {
            setActiveNewTaskType(newTaskType);
        }
    }, [newTaskType]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = tasks.findIndex((t) => t.id === active.id);
            const newIndex = tasks.findIndex((t) => t.id === over?.id);

            const newTasks = arrayMove(tasks, oldIndex, newIndex).map((task, index) => ({
                ...task,
                order_index: index
            }));

            // Optimistic update
            onTasksReordered(newTasks);

            // Persist to database
            try {
                const updates = newTasks.map(task => ({
                    id: task.id,
                    worksheet_id: worksheetId,
                    title: task.title,
                    task_type: task.task_type,
                    order_index: task.order_index,
                    content: task.content
                }));

                const { error } = await supabase
                    .from('tasks')
                    .upsert(updates);

                if (error) throw error;
            } catch (error) {
                console.error('Error updating task order:', error);
                showNotification('Failed to save new order', 'error');
                // Revert would be complex here, relying on next fetch or user refresh
            }
        }
    };

    const handleDelete = async (taskId: string) => {
        setDeleteConfirmation({ show: true, taskId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation.taskId) return;

        const { error } = await supabase.from('tasks').delete().eq('id', deleteConfirmation.taskId);

        if (error) {
            alert("Could not delete the task.");
            console.error(error);
        } else {
            onTaskDeleted(deleteConfirmation.taskId);
            setDeleteConfirmation({ show: false, taskId: null });
            showNotification('Task deleted successfully!', 'success');
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, taskId: null });
    };

    const handleAITasksGenerated = (generatedTasks: Task[]) => {
        generatedTasks.forEach(task => onTaskAdded(task));
        setShowAIGenerator(false);
        showNotification('Tasks generated successfully!', 'success');
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setActiveNewTaskType(null);
    };

    const handleCreateTask = (type: string) => {
        setActiveNewTaskType(type);
        setEditingTask(null);
        setIsTaskTypeSelectorOpen(false);
    };

    const closeEditor = () => {
        setEditingTask(null);
        setActiveNewTaskType(null);
    };

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ show: true, message, type });
    };

    const taskTypes = [
        { id: 'open-question', label: 'Open Question', description: 'Standard question with text answer', icon: '📝' },
        { id: 'multiple-choice', label: 'Multiple Choice', description: 'Select one or more correct options', icon: '☑️' },
        { id: 'single-choice', label: 'Single Choice', description: 'Select exactly one correct option', icon: '🔘' },
        { id: 'fill-gaps', label: 'Fill in Gaps', description: 'Complete the missing words in text', icon: '🔤' },
        { id: 'matching', label: 'Matching', description: 'Match items from two lists', icon: '🔄' },
        { id: 'ordering', label: 'Ordering', description: 'Arrange items in correct sequence', icon: '🔢' },
        { id: 'information', label: 'Information', description: 'Read-only text or instructions', icon: 'ℹ️' },
        { id: 'essay', label: 'Essay', description: 'Long form text answer', icon: '📄' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Tasks ({tasks.length})</h3>
                    <p className="text-sm text-muted-foreground">Manage the questions and content for this worksheet.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowAIGenerator(true)}
                        className="gap-2"
                    >
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        Generate with AI
                    </Button>
                    <Button
                        onClick={() => setIsTaskTypeSelectorOpen(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Task List with Drag and Drop */}
            <div className="space-y-3">
                {tasks.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tasks.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {tasks.map((task, index) => (
                                <SortableTaskItem
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    onEdit={handleEditTask}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                        <p className="text-muted-foreground mb-4">No tasks added yet.</p>
                        <Button onClick={() => setIsTaskTypeSelectorOpen(true)}>
                            Create your first task
                        </Button>
                    </div>
                )}
            </div>

            {/* Task Type Selector Dialog */}
            <Dialog open={isTaskTypeSelectorOpen} onOpenChange={setIsTaskTypeSelectorOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Choose Task Type</DialogTitle>
                        <DialogDescription>
                            Select the type of task you want to add to this worksheet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4">
                        {taskTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => handleCreateTask(type.id)}
                                className="flex flex-col items-start p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-left"
                            >
                                <span className="text-2xl mb-2">{type.icon}</span>
                                <span className="font-medium">{type.label}</span>
                                <span className="text-xs text-muted-foreground mt-1">{type.description}</span>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Task Editor Sheet */}
            <Sheet open={!!editingTask || !!activeNewTaskType} onOpenChange={(open) => !open && closeEditor()}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
                    <div className="p-6">
                        <SheetHeader className="mb-6">
                            <SheetTitle>
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </SheetTitle>
                            <SheetDescription>
                                {editingTask ? 'Update the details of this task.' : 'Configure the new task details below.'}
                            </SheetDescription>
                        </SheetHeader>

                        <AdvancedTaskForm
                            worksheetId={worksheetId}
                            onTaskCreated={(task) => {
                                onTaskAdded(task);
                                closeEditor();
                                showNotification(editingTask ? 'Task updated!' : 'Task created!', 'success');
                            }}
                            existingTasksCount={tasks.length}
                            initialTaskType={activeNewTaskType}
                            editingTask={editingTask}
                            onCancel={closeEditor}
                        />
                    </div>
                </SheetContent>
            </Sheet>

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
            <Dialog open={deleteConfirmation.show} onOpenChange={(open) => !open && cancelDelete()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Notification Toast (using sonner ideally, but keeping existing modal for now if needed, or better yet, replace with sonner) */}
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

    const handleTasksReordered = (reorderedTasks: Task[]) => {
        setTasks(reorderedTasks);
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
                        onTasksReordered={handleTasksReordered}
                        initialTab={initialTab}
                        newTaskType={newTaskType}
                    />
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
