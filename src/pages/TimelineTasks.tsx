import React, { useState } from 'react';
import { Event, Task } from '../../server/models/types.ts';
import { tasksService } from '../services/tasks.ts';

interface TimelineTasksProps {
  event: Event;
  tasks: Task[];
  onOpenAddTask: () => void;
  onRefreshTasks: () => void;
}

export const TimelineTasks: React.FC<TimelineTasksProps> = ({
  event,
  tasks,
  onOpenAddTask,
  onRefreshTasks,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleToggle = async (task: Task) => {
    try {
      setUpdatingTaskId(task.id);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await tasksService.updateTask(task.id, { status: newStatus });
      onRefreshTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this milestone task?')) return;
    try {
      await tasksService.deleteTask(taskId);
      onRefreshTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pct = Math.round((completedCount / (tasks.length || 1)) * 100);

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs text-secondary font-label-sm uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Master Milestone Schedule</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Timeline &amp; Tasks</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Chronological milestone governance, cross-vendor dependencies, and operational approvals for {event.name}.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <div className="bg-surface-container px-4 py-2 rounded-xl text-center">
              <span className="text-xs text-outline block font-semibold">Overall Completion</span>
              <span className="font-title-lg text-title-lg text-primary font-bold">{pct}% ({completedCount}/{tasks.length})</span>
            </div>
            <button
              onClick={onOpenAddTask}
              className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add Milestone Task</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-outline">Priority:</span>
            {['all', 'high', 'medium', 'normal', 'routine'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                  filterPriority === p ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-outline">Status:</span>
            {['all', 'pending', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${
                  filterStatus === s ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-space-sm">
          {filtered.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm transition-all ${
                  isCompleted ? 'opacity-60 bg-surface-container-low/50' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-space-sm min-w-0">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    disabled={updatingTaskId === task.id}
                    onChange={() => handleToggle(task)}
                    className="mt-1 h-5 w-5 rounded accent-primary cursor-pointer shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-title-md text-title-md text-primary leading-tight ${isCompleted ? 'line-through text-outline' : ''}`}>
                        {task.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container text-on-surface-variant">
                        {task.category}
                      </span>
                      <span className="text-xs font-medium text-secondary">
                        Due: {task.dueDate} ({task.dueLabel})
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {task.description} • Assigned to: <strong>{task.assignedTo}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      task.priority === 'high'
                        ? 'bg-secondary text-on-secondary'
                        : task.priority === 'medium'
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 text-outline hover:text-error transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
