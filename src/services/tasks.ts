import { api } from './api.ts';
import { Task } from '../../server/models/types.ts';

export const tasksService = {
  async getTasks(eventId: string): Promise<{ success: boolean; tasks: Task[] }> {
    return api.get(`/events/${eventId}/tasks`);
  },

  async createTask(eventId: string, taskData: Partial<Task>): Promise<{ success: boolean; task: Task }> {
    return api.post(`/events/${eventId}/tasks`, taskData);
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ success: boolean; task: Task }> {
    return api.patch(`/tasks/${taskId}`, updates);
  },

  async deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/tasks/${taskId}`);
  },
};
