import { api } from './api.ts';
import { BudgetCategory, Expense } from '../../server/models/types.ts';

export const budgetService = {
  async getBudget(eventId: string): Promise<{ success: boolean; metrics: any; categories: BudgetCategory[] }> {
    return api.get(`/events/${eventId}/budget`);
  },

  async updateBudgetCategories(
    eventId: string,
    categories: Array<Partial<BudgetCategory>>
  ): Promise<{ success: boolean; categories: BudgetCategory[]; metrics: any }> {
    return api.put(`/events/${eventId}/budget`, { categories });
  },

  async getExpenses(eventId: string): Promise<{ success: boolean; expenses: Expense[]; total: number }> {
    return api.get(`/events/${eventId}/expenses`);
  },

  async createExpense(
    eventId: string,
    expenseData: Partial<Expense>
  ): Promise<{ success: boolean; expense: Expense; metrics: any }> {
    return api.post(`/events/${eventId}/expenses`, expenseData);
  },

  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<{ success: boolean; expense: Expense }> {
    return api.patch(`/expenses/${expenseId}`, updates);
  },

  async deleteExpense(expenseId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/expenses/${expenseId}`);
  },
};
