import { api } from './api.ts';
import { Event } from '../../server/models/types.ts';

export const eventsService = {
  async getEvents(): Promise<{ success: boolean; events: Event[] }> {
    return api.get('/events');
  },

  async getEvent(id: string): Promise<{ success: boolean; event: Event }> {
    return api.get(`/events/${id}`);
  },

  async createEvent(eventData: Partial<Event>): Promise<{ success: boolean; event: Event }> {
    return api.post('/events', eventData);
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<{ success: boolean; event: Event }> {
    return api.patch(`/events/${id}`, updates);
  },

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/events/${id}`);
  },

  async getDashboardSummary(eventId: string): Promise<any> {
    return api.get(`/dashboard/summary?eventId=${eventId}`);
  },
};
