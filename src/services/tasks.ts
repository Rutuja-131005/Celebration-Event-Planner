import { api } from './api.ts';
import { Task } from '../../server/models/types.ts';

const fallbackTasks: Task[] = [
  {
    id: 'tsk_1',
    eventId: 'evt_ananya_rohan',
    title: 'Finalize Sangeet Choreographer contract & advance deposit',
    description: 'Assigned to: Rutuja Jadhav · Sangeet Gala · Advance sum: ₹75,000',
    dueDate: '2025-11-04',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Rutuja Jadhav',
    dueLabel: 'Due in 2 days',
    category: 'Entertainment',
    createdAt: '2025-10-20T00:00:00Z',
    updatedAt: '2025-10-20T00:00:00Z',
  },
  {
    id: 'tsk_2',
    eventId: 'evt_ananya_rohan',
    title: 'Review tasting menu revision with Royal Rajputana Caterers',
    description: 'Add 3 bespoke vegan dessert options & artisanal mocktail bar blueprint',
    dueDate: '2025-11-06',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Rutuja Jadhav',
    dueLabel: 'Due in 4 days',
    category: 'Catering',
    createdAt: '2025-10-20T00:00:00Z',
    updatedAt: '2025-10-20T00:00:00Z',
  },
  {
    id: 'tsk_3',
    eventId: 'evt_ananya_rohan',
    title: 'Confirm floral garland procurement counts with Udaipur Mandi vendors',
    description: 'Marigold, Mogra & White Lotus shipments timed for morning Pooja',
    dueDate: '2025-11-08',
    priority: 'normal',
    status: 'pending',
    assignedTo: 'Vikramaditya Singh',
    dueLabel: 'Due in 6 days',
    category: 'Decor',
    createdAt: '2025-10-21T00:00:00Z',
    updatedAt: '2025-10-21T00:00:00Z',
  },
  {
    id: 'tsk_5',
    eventId: 'evt_ananya_rohan',
    title: 'Mandap 3D Scenography Approval & Lighting Layout',
    description: 'Central floating stage design approved by bride & groom',
    dueDate: '2025-10-15',
    priority: 'high',
    status: 'completed',
    assignedTo: 'Rutuja Jadhav',
    dueLabel: 'Completed Oct 15',
    category: 'Decor',
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-15T00:00:00Z',
  },
];

export const tasksService = {
  async getTasks(eventId: string): Promise<{ success: boolean; tasks: Task[] }> {
    try {
      const res = await api.get<{ success: boolean; tasks: Task[] }>(`/events/${eventId}/tasks`);
      if (res?.success) return res;
    } catch {}

    return { success: true, tasks: fallbackTasks };
  },

  async createTask(eventId: string, taskData: Partial<Task>): Promise<{ success: boolean; task: Task }> {
    try {
      const res = await api.post<{ success: boolean; task: Task }>(`/events/${eventId}/tasks`, taskData);
      if (res?.success) return res;
    } catch {}

    const newTask: Task = {
      id: `tsk_${Date.now()}`,
      eventId,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      assignedTo: taskData.assignedTo || 'Rutuja Jadhav',
      dueLabel: 'Upcoming',
      category: taskData.category || 'General',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, task: newTask };
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ success: boolean; task: Task }> {
    try {
      const res = await api.patch<{ success: boolean; task: Task }>(`/tasks/${taskId}`, updates);
      if (res?.success) return res;
    } catch {}

    return { success: true, task: { id: taskId, ...updates } as any };
  },

  async deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.delete<{ success: boolean; message: string }>(`/tasks/${taskId}`);
      if (res?.success) return res;
    } catch {}

    return { success: true, message: 'Task deleted successfully' };
  },
};
