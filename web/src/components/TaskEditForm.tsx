"use client";

import { useState } from 'react';
import { WorksheetElement } from '../types/database';

interface TaskEditFormProps {
  task: WorksheetElement;
  onSave: (updatedContent: Record<string, unknown>) => void;
  onCancel: () => void;
}

export const TaskEditForm = ({ task, onSave, onCancel }: TaskEditFormProps) => {
  const taskContent = task.content as Record<string, unknown>;
  const [title, setTitle] = useState(String(taskContent?.title || taskContent?.question || ''));
  const [description, setDescription] = useState(String(taskContent?.description || ''));

  const handleSave = () => {
    const updatedContent = {
      ...taskContent,
      title: title.trim(),
      question: title.trim(), // Keep both for backwards compatibility
      description: description.trim()
    };
    onSave(updatedContent);
  };

  return (
    <div style={{
      width: '100%',
      padding: '16px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '4px'
        }}>
          Task Title/Question
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '4px'
        }}>
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};
