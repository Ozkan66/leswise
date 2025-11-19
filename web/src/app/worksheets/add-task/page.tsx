"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import AuthenticatedLayout from '../../../components/AuthenticatedLayout';
import { ArrowLeft } from 'lucide-react';

type TaskType = "information" | "multiple_choice" | "single_choice" | "short_answer" | "essay" | "matching" | "ordering" | "fill_gaps";

interface TaskTypeInfo {
  type: TaskType;
  label: string;
  description: string;
  icon: string;
}

const taskTypes: TaskTypeInfo[] = [
  {
    type: "information",
    label: "Text/Information",
    description: "Add instructional text, explanations, or information blocks",
    icon: "📝"
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Questions with multiple answer options (multiple correct answers allowed)",
    icon: "☑️"
  },
  {
    type: "single_choice",
    label: "Single Choice",
    description: "Questions with one correct answer from multiple options",
    icon: "🔘"
  },
  {
    type: "short_answer",
    label: "Short Answer",
    description: "Open text questions for brief responses",
    icon: "✍️"
  },
  {
    type: "essay",
    label: "Essay",
    description: "Extended text questions for detailed responses",
    icon: "📄"
  },
  {
    type: "matching",
    label: "Matching Pairs",
    description: "Match items from one column to items in another column",
    icon: "🔗"
  },
  {
    type: "ordering",
    label: "Put in Order",
    description: "Arrange items in the correct sequence",
    icon: "🔢"
  },
  {
    type: "fill_gaps",
    label: "Fill in the Gaps",
    description: "Text with blank spaces for students to complete",
    icon: "🔤"
  }
];

export default function AddTaskPage() {
  return (
    <Suspense fallback={
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen bg-muted/30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    }>
      <AddTaskPageContent />
    </Suspense>
  );
}

function AddTaskPageContent() {
  const [worksheetId, setWorksheetId] = useState<string | null>(null);
  const [worksheetTitle, setWorksheetTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const fetchWorksheetDetails = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('worksheets')
        .select('title, owner_id')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.owner_id !== user?.id) {
        setError('You do not have permission to edit this worksheet');
        return;
      }

      setWorksheetTitle(data.title);
    } catch (err) {
      setError('Failed to load worksheet details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const id = searchParams.get('worksheet');
    if (id) {
      setWorksheetId(id);
      fetchWorksheetDetails(id);
    } else {
      setError('No worksheet selected');
      setLoading(false);
    }
  }, [searchParams, fetchWorksheetDetails]);

  const handleTypeSelection = (type: TaskType) => {
    if (!worksheetId) return;

    // Navigate to task creation form with the selected type
    router.push(`/worksheets/${worksheetId}/edit?tab=add-tasks&newTask=${type}`);
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen bg-muted/30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen bg-muted/30">
          <div className="max-w-md p-8 bg-card rounded-lg shadow-sm text-center border border-border">
            <h2 className="text-destructive text-xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link
              href="/worksheets"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={worksheetId ? `/worksheets/${worksheetId}/edit` : '/worksheets'}
                className="flex items-center px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Add New Task
                </h1>
                {worksheetTitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    to &quot;{worksheetTitle}&quot;
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Choose Task Type
            </h2>
            <p className="text-muted-foreground">
              Select the type of task you want to add to your worksheet
            </p>
          </div>

          {/* Task Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {taskTypes.map((taskType) => (
              <button
                key={taskType.type}
                onClick={() => handleTypeSelection(taskType.type)}
                className="group block w-full p-6 bg-card border-2 border-border rounded-xl text-left cursor-pointer transition-all hover:border-primary hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {taskType.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {taskType.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {taskType.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
              💡 Tips for Creating Tasks
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-disc pl-5">
              <li>
                <strong>Text/Information:</strong> Use for instructions, explanations, or content blocks
              </li>
              <li>
                <strong>Multiple Choice:</strong> Great for knowledge checks with several possible correct answers
              </li>
              <li>
                <strong>Single Choice:</strong> Perfect for questions with one clear correct answer
              </li>
              <li>
                <strong>Short Answer:</strong> For brief responses, definitions, or calculations
              </li>
              <li>
                <strong>Essay:</strong> For detailed explanations, analysis, or creative writing
              </li>
              <li>
                <strong>Matching:</strong> Help students connect related concepts or terms
              </li>
              <li>
                <strong>Ordering:</strong> Test understanding of sequences, processes, or chronology
              </li>
              <li>
                <strong>Fill in the Gaps:</strong> Test specific knowledge within context
              </li>
            </ul>
          </div>
        </main>
      </div>
    </AuthenticatedLayout>
  );
}
