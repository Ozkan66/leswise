
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Task } from '../types/database';
import { NotificationModal } from './NotificationModal';

interface CreateTaskFormProps {
  worksheetId: string;
  onTaskCreated: (newTask: Task) => void;
  existingTasksCount: number;
  initialTaskType?: string | null;
}

export const CreateTaskForm = ({ worksheetId, onTaskCreated, existingTasksCount, initialTaskType }: CreateTaskFormProps) => {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState('open-question');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Set initial task type if provided
  useEffect(() => {
    if (initialTaskType) {
      // Map our task types to the form options
      const taskTypeMap: Record<string, string> = {
        'text': 'information',
        'multiple_choice': 'multiple-choice',
        'single_choice': 'single-choice',
        'short_answer': 'open-question',
        'essay': 'open-question',
        'matching': 'matching',
        'ordering': 'ordering',
        'fill_gaps': 'fill-gaps'
      };

      const mappedType = taskTypeMap[initialTaskType] || 'open-question';
      setTaskType(mappedType);
      console.log('Setting initial task type:', initialTaskType, '→', mappedType);
    }
  }, [initialTaskType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !taskType) {
      alert("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    console.log('Creating task:', { worksheetId, title, taskType, orderIndex: existingTasksCount });

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        worksheet_id: worksheetId,
        title: title,
        content: {
          title: title,
          question: title, // For backwards compatibility
          type: taskType
        }, // Structure content as JSONB object
        task_type: taskType, // Keep type field for easy filtering
        order_index: existingTasksCount, // Task uses 'order_index' field
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      setNotification({
        show: true,
        message: `Failed to create task: ${error.message}`,
        type: 'error'
      });
    } else if (data) {
      console.log('Task created successfully:', data);
      // Call onTaskCreated first to update state
      onTaskCreated(data);
      setTitle(''); // Reset form
      // Then show notification after state update
      setTimeout(() => {
        setNotification({
          show: true,
          message: 'New task added successfully.',
          type: 'success'
        });
      }, 100);
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="task-title"
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}
        >
          Task Title
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., What is the capital of France?"
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none'
          }}
          onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#2563eb'}
          onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="task-type"
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '4px'
          }}
        >
          Task Type
        </label>
        <select
          id="task-type"
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            outline: 'none'
          }}
          onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#2563eb'}
          onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
        >
          <option value="open-question">Open Question</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="single_choice">Single Choice</option>
          <option value="short_answer">Short Answer</option>
          <option value="essay">Essay</option>
          <option value="information">Information/Text</option>
          <option value="matching">Matching</option>
          <option value="ordering">Ordering</option>
          <option value="fill_gaps">Fill in the Gaps</option>
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '8px 16px',
            backgroundColor: isSubmitting ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
            }
          }}
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </div>

      <NotificationModal
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: '', type: 'success' })}
      />
    </form>
  );
};
