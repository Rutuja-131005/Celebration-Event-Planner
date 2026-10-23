import { api } from './api.ts';
import { Prediction, ScenarioSimulationResult } from '../../server/models/types.ts';

export const predictionsService = {
  async getLatestPrediction(eventId: string): Promise<{ success: boolean; prediction: Prediction }> {
    return api.get(`/events/${eventId}/predictions/latest`);
  },

  async runScenario(
    eventId: string,
    guestShift: number,
    decorTier: string,
    barPackage: string,
    saveSnapshot = false,
    title?: string
  ): Promise<{ success: boolean; simulation: ScenarioSimulationResult; savedSnapshot?: any }> {
    return api.post(`/events/${eventId}/scenarios`, {
      guestShift,
      decorTier,
      barPackage,
      saveSnapshot,
      title,
    });
  },

  async getSavedScenarios(eventId: string): Promise<{ success: boolean; scenarios: any[] }> {
    return api.get(`/events/${eventId}/scenarios`);
  },
};
