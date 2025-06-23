"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { WorksheetElement } from '../types/database';

interface AdvancedTaskFormProps {
  worksheetId: string;
  onTaskCreated: (newTask: WorksheetElement) => void;
  existingTasksCount: number;
  initialTaskType?: string | null;
  onCancel?: () => void;
  editingTask?: WorksheetElement | null; // Add edit mode support
}

interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export const AdvancedTaskForm = ({ 
  worksheetId, 
  onTaskCreated, 
  existingTasksCount, 
  initialTaskType,
  onCancel,
  editingTask 
}: AdvancedTaskFormProps) => {
  const isEditMode = !!editingTask;
  const editContent = editingTask?.content as Record<string, unknown> | undefined;
  
  // Determine initial task type: prefer editingTask type in edit mode, otherwise use initialTaskType
  const initialType = isEditMode ? 
    (editingTask?.type || 'open-question') : 
    (initialTaskType || 'open-question');
  
  const [taskType, setTaskType] = useState(initialType);
  const [title, setTitle] = useState(
    String(editContent?.title || editContent?.question || '')
  );
  const [description, setDescription] = useState(
    String(editContent?.description || '')
  );
  const [points, setPoints] = useState(
    editingTask?.max_score || 1
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update taskType when editingTask changes
  useEffect(() => {
    if (editingTask) {
      const newTaskType = editingTask.type || 'open-question';
      setTaskType(newTaskType);
    } else if (initialTaskType) {
      setTaskType(initialTaskType);
    }
  }, [editingTask, initialTaskType]);

  // Multiple choice specific state - initialize from edit data
  const initializeOptions = () => {
    if (editContent?.options && Array.isArray(editContent.options)) {
      return (editContent.options as string[]).map((text: string, index: number) => ({
        id: String(index + 1),
        text,
        isCorrect: Array.isArray(editContent.correctAnswers) 
          ? (editContent.correctAnswers as number[]).includes(index)
          : false
      }));
    }
    return [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false }
    ];
  };

  const [options, setOptions] = useState<MultipleChoiceOption[]>(initializeOptions());

  // Information/text specific state
  const [content, setContent] = useState(
    String(editContent?.content || '')
  );

  // Matching specific state
  const [leftItems, setLeftItems] = useState<string[]>(
    Array.isArray(editContent?.leftItems) 
      ? editContent.leftItems as string[]
      : ['', '']
  );
  const [rightItems, setRightItems] = useState<string[]>(
    Array.isArray(editContent?.rightItems)
      ? editContent.rightItems as string[]
      : ['', '']
  );

  // Fill gaps specific state
  const [textWithGaps, setTextWithGaps] = useState(
    String(editContent?.textWithGaps || '')
  );
  const [gapAnswers, setGapAnswers] = useState<string[]>(
    Array.isArray(editContent?.gapAnswers)
      ? editContent.gapAnswers as string[]
      : ['']
  );

  useEffect(() => {
    if (initialTaskType) {
      setTaskType(initialTaskType);
    }
  }, [initialTaskType]);

  const addOption = () => {
    setOptions([...options, { id: Date.now().toString(), text: '', isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const toggleCorrectOption = (id: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
    ));
  };

  const addLeftItem = () => setLeftItems([...leftItems, '']);
  const addRightItem = () => setRightItems([...rightItems, '']);
  const updateLeftItem = (index: number, value: string) => {
    const newItems = [...leftItems];
    newItems[index] = value;
    setLeftItems(newItems);
  };
  const updateRightItem = (index: number, value: string) => {
    const newItems = [...rightItems];
    newItems[index] = value;
    setRightItems(newItems);
  };

  const addGapAnswer = () => setGapAnswers([...gapAnswers, '']);
  const updateGapAnswer = (index: number, value: string) => {
    const newAnswers = [...gapAnswers];
    newAnswers[index] = value;
    setGapAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    setIsSubmitting(true);

    // Build content object based on task type
    let taskContent: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      points: points
    };

    switch (taskType) {
      case 'multiple-choice':
      case 'single-choice':
        if (options.some(opt => !opt.text.trim())) {
          alert("Please fill in all answer options.");
          setIsSubmitting(false);
          return;
        }
        taskContent = {
          ...taskContent,
          options: options.filter(opt => opt.text.trim()).map(opt => opt.text),
          correctAnswers: options
            .map((opt, index) => opt.isCorrect ? index : -1)
            .filter(index => index !== -1),
          allowMultiple: taskType === 'multiple-choice'
        };
        break;

      case 'information':
      case 'text':
        if (!content.trim()) {
          alert("Please enter the content text.");
          setIsSubmitting(false);
          return;
        }
        taskContent = {
          ...taskContent,
          content: content.trim()
        };
        break;

      case 'matching':
        if (leftItems.some(item => !item.trim()) || rightItems.some(item => !item.trim())) {
          alert("Please fill in all matching items.");
          setIsSubmitting(false);
          return;
        }
        taskContent = {
          ...taskContent,
          leftItems: leftItems.filter(item => item.trim()),
          rightItems: rightItems.filter(item => item.trim())
        };
        break;

      case 'fill-gaps':
        if (!textWithGaps.trim() || gapAnswers.some(answer => !answer.trim())) {
          alert("Please enter the text with gaps and all gap answers.");
          setIsSubmitting(false);
          return;
        }
        taskContent = {
          ...taskContent,
          textWithGaps: textWithGaps.trim(),
          gapAnswers: gapAnswers.filter(answer => answer.trim())
        };
        break;

      case 'open-question':
      case 'essay':
      default:
        // Just title and description for open questions
        break;
    }

    try {
      if (isEditMode && editingTask) {
        // Update existing task
        const { data, error } = await supabase
          .from('worksheet_elements')
          .update({
            content: taskContent,
            type: taskType,
            max_score: points
          })
          .eq('id', editingTask.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating task:', error);
          alert(`Failed to update task: ${error.message}`);
        } else if (data) {
          console.log('Task updated successfully:', data);
          alert("Task updated successfully!");
          onTaskCreated(data); // Use same callback for consistency
          // Don't reset form in edit mode, just close
        }
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('worksheet_elements')
          .insert([{
            worksheet_id: worksheetId,
            content: taskContent,
            type: taskType,
            position: existingTasksCount,
            max_score: points
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating task:', error);
          alert(`Failed to create task: ${error.message}`);
        } else if (data) {
          console.log('Task created successfully:', data);
          alert("Task created successfully!");
          onTaskCreated(data);
          // Reset form for create mode
          setTitle('');
          setDescription('');
          setPoints(1);
          setOptions([{ id: '1', text: '', isCorrect: false }, { id: '2', text: '', isCorrect: false }]);
          setContent('');
          setLeftItems(['', '']);
          setRightItems(['', '']);
          setTextWithGaps('');
          setGapAnswers(['']);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred.');
    }

    setIsSubmitting(false);
  };

  const renderTaskTypeSpecificFields = () => {
    switch (taskType) {
      case 'multiple-choice':
      case 'single-choice':
        return (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Answer Options {taskType === 'multiple-choice' ? '(Check all correct answers)' : '(Check the correct answer)'}
            </label>
            {options.map((option, index) => (
              <div key={option.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type={taskType === 'single-choice' ? 'radio' : 'checkbox'}
                  name={taskType === 'single-choice' ? 'correct-answer' : undefined}
                  checked={option.isCorrect}
                  onChange={() => {
                    if (taskType === 'single-choice') {
                      // For single choice, uncheck all others first
                      setOptions(options.map(opt => ({ ...opt, isCorrect: opt.id === option.id })));
                    } else {
                      toggleCorrectOption(option.id);
                    }
                  }}
                  style={{ marginRight: '8px' }}
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginRight: '8px'
                  }}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
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
              + Add Option
            </button>
          </div>
        );

      case 'information':
      case 'text':
        return (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the information or text content..."
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
        );

      case 'matching':
        return (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Left Items
                </label>
                {leftItems.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => updateLeftItem(index, e.target.value)}
                    placeholder={`Left item ${index + 1}`}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={addLeftItem}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Add Left Item
                </button>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Right Items
                </label>
                {rightItems.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => updateRightItem(index, e.target.value)}
                    placeholder={`Right item ${index + 1}`}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={addRightItem}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Add Right Item
                </button>
              </div>
            </div>
          </div>
        );

      case 'fill-gaps':
        return (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Text with Gaps (use ___ for gaps)
              </label>
              <textarea
                value={textWithGaps}
                onChange={(e) => setTextWithGaps(e.target.value)}
                placeholder="Enter text with gaps marked as ___. For example: The capital of France is ___."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Gap Answers
              </label>
              {gapAnswers.map((answer, index) => (
                <input
                  key={index}
                  type="text"
                  value={answer}
                  onChange={(e) => updateGapAnswer(index, e.target.value)}
                  placeholder={`Answer for gap ${index + 1}`}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}
                />
              ))}
              <button
                type="button"
                onClick={addGapAnswer}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                + Add Gap Answer
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '24px',
      marginTop: '24px'
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
        {isEditMode ? 'Edit Task' : 'Create New Task'}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Task Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Task Type
          </label>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="open-question">Open Question</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="single-choice">Single Choice</option>
            <option value="information">Information/Text</option>
            <option value="essay">Essay</option>
            <option value="matching">Matching</option>
            <option value="ordering">Ordering</option>
            <option value="fill-gaps">Fill in the Gaps</option>
          </select>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Task Title/Question
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., What is the capital of France?"
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Description/Instructions (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide additional instructions or context..."
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Points */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Points
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            style={{
              width: '100px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Task Type Specific Fields */}
        {renderTaskTypeSpecificFields()}

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
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
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '8px 16px',
              backgroundColor: isSubmitting ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};
