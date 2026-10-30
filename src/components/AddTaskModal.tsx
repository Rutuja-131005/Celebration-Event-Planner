import React, { useState } from 'react';
import { tasksService } from '../services/tasks.ts';
import { Task } from '../../server/models/types.ts';
import { Modal } from './Modal.tsx';

interface AddTaskModalProps {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  eventId,
  onClose,
  onTaskAdded,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2025-11-12');
  const [priority, setPriority] = useState<'high' | 'medium' | 'normal' | 'routine'>('high');
  const [assignedTo, setAssignedTo] = useState('Rutuja Jadhav');
  const [category, setCategory] = useState('Entertainment');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await tasksService.createTask(eventId, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        assignedTo: assignedTo.trim(),
        category: category.trim(),
      });

      if (res.success && res.task) {
        onTaskAdded(res.task);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create milestone task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="add-task-title"
      descriptionId="add-task-desc"
      maxWidthClass="max-w-lg"
    >
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[24px]" aria-hidden="true">
            checklist
          </span>
          <h3 id="add-task-title" className="font-headline-sm text-headline-sm text-primary">
            Add Milestone Task
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-outline hover:text-primary transition-colors cursor-pointer rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          type="button"
          aria-label="Close add task dialog"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      <p id="add-task-desc" className="sr-only">
        Create an operational checklist milestone task for event execution.
      </p>

      {error && (
        <div
          id="task-error-msg"
          role="alert"
          aria-live="polite"
          className="p-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Task Title
          </label>
          <input
            id="task-title"
            type="text"
            required
            aria-invalid={!!error}
            aria-describedby={error ? 'task-error-msg' : undefined}
            placeholder="e.g. Confirm acoustic Sufi technical rider with Svaram Ensemble"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
          />
        </div>

        <div>
          <label htmlFor="task-desc" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Operational Scope &amp; Deliverable Notes
          </label>
          <textarea
            id="task-desc"
            rows={2}
            placeholder="e.g. Dual acoustic monitors and 18x12ft stage platform verification"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-date" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Target Due Date
            </label>
            <input
              id="task-date"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>
          <div>
            <label htmlFor="task-priority" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Priority Urgency
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm cursor-pointer"
            >
              <option value="high">High (Action Required)</option>
              <option value="medium">Medium</option>
              <option value="normal">Normal</option>
              <option value="routine">Routine</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-assigned" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Assigned Planner
            </label>
            <input
              id="task-assigned"
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>
          <div>
            <label htmlFor="task-category" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Functional Pillar
            </label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm cursor-pointer"
            >
              <option value="Entertainment">Entertainment</option>
              <option value="Catering">Catering &amp; Beverage</option>
              <option value="Decor">Decor &amp; Production</option>
              <option value="Venues">Venues &amp; Lodging</option>
              <option value="Logistics">Logistics &amp; Transport</option>
            </select>
          </div>
        </div>

        <div className="pt-space-sm flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer hover:bg-primary-container disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {submitting ? 'Creating...' : 'Assign Milestone'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
