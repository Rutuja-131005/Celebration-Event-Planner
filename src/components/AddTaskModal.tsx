import React, { useState } from 'react';
import { tasksService } from '../services/tasks.ts';
import { Task } from '../../server/models/types.ts';

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
  const [assignedTo, setAssignedTo] = useState('Priya Sharma');
  const [category, setCategory] = useState('Entertainment');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const res = await tasksService.createTask(eventId, {
        title,
        description,
        dueDate,
        priority,
        assignedTo,
        category,
      });

      if (res.success && res.task) {
        onTaskAdded(res.task);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant/40 space-y-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">checklist</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Add Milestone Task</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-primary transition-colors cursor-pointer" type="button">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Confirm acoustic Sufi technical rider with Svaram Ensemble"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Operational Scope & Deliverable Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dual acoustic monitors and 18x12ft stage platform verification"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Target Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium</option>
                <option value="normal">Normal</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Assigned Atelier Lead
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Pillar Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              >
                <option>Entertainment</option>
                <option>Catering</option>
                <option>Decor</option>
                <option>Venues</option>
                <option>Logistics</option>
                <option>Guest Relations</option>
              </select>
            </div>
          </div>

          <div className="pt-space-sm flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Schedule Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
