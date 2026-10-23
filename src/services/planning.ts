import { api } from './api.ts';
import { AIPlanVersion, Event } from '../../server/models/types.ts';

export const planningService = {
  async getPlans(eventId: string): Promise<{ success: boolean; plans: AIPlanVersion[] }> {
    return api.get(`/events/${eventId}/plans`);
  },

  async generatePlan(
    eventId: string,
    prompt: string,
    customTitle?: string,
    eventType?: string
  ): Promise<{ success: boolean; plan: AIPlanVersion }> {
    return api.post(`/events/${eventId}/generate-plan`, { prompt, customTitle, eventType });
  },

  async replan(
    eventId: string,
    adjustmentInstruction: string,
    eventType?: string
  ): Promise<{ success: boolean; plan: AIPlanVersion }> {
    return api.post(`/events/${eventId}/replan`, { adjustmentInstruction, eventType });
  },

  async applyPlan(
    eventId: string,
    planId: string
  ): Promise<{ success: boolean; event: Event; categoriesUpdated: number; tasksAdded: number }> {
    return api.post(`/events/${eventId}/apply-ai-plan`, { planId });
  },
};
