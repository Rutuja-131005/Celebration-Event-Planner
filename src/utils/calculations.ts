/**
 * Pure Domain Calculations & Computational Models
 * Handles financial variance, readiness scores, and milestone countdowns.
 */

/**
 * Calculates financial budget variance and overrun flags between planned and actual values.
 *
 * @param planned - Budgeted/target amount.
 * @param actual - Actual committed or spent amount.
 * @returns Variance object with net delta, variance percentage, and overrun boolean.
 */
export function calculateBudgetVariance(
  planned: number,
  actual: number
): { variance: number; percentage: number; isOverrun: boolean } {
  const variance = actual - planned;
  const percentage = planned > 0 ? Number(((variance / planned) * 100).toFixed(1)) : 0;
  return {
    variance,
    percentage,
    isOverrun: variance > 0,
  };
}

/**
 * Computes calendar days remaining until an upcoming event milestone.
 *
 * @param eventDate - ISO string date of the event (e.g. "2025-12-14").
 * @returns Non-negative days remaining count.
 */
export function calculateDaysRemaining(eventDate: string): number {
  if (!eventDate) return 0;
  const now = new Date();
  const target = new Date(eventDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculates a celebration readiness index (0-100) based on task completion,
 * vendor booking commitments, and budget reconciliation status.
 *
 * @param completedTasks - Count of verified completed tasks.
 * @param totalTasks - Total milestone task count.
 * @param committedPercentage - Percentage of overall budget committed.
 * @returns Weighted readiness score between 0 and 100.
 */
export function calculateReadinessIndex(
  completedTasks: number,
  totalTasks: number,
  committedPercentage: number
): number {
  const taskWeight = totalTasks > 0 ? (completedTasks / totalTasks) * 60 : 30;
  const budgetWeight = Math.min(40, (committedPercentage / 100) * 40);
  return Math.min(100, Math.round(taskWeight + budgetWeight));
}

/**
 * Standard celebratory category percentage distribution template.
 */
export const DEFAULT_CATEGORY_WEIGHTS: Record<string, number> = {
  catering: 0.34,
  decor: 0.288,
  venueSound: 0.192,
  artists: 0.10,
  contingency: 0.08,
};

/**
 * Computes category distribution sums based on target budget.
 *
 * @param totalBudget - Aggregate target budget cap.
 * @param weights - Optional customized weighting factors.
 * @returns Category allocation map in INR.
 */
export function computeCategoryAllocations(
  totalBudget: number,
  weights: Record<string, number> = DEFAULT_CATEGORY_WEIGHTS
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, weight] of Object.entries(weights)) {
    result[key] = Math.round(totalBudget * weight);
  }
  return result;
}
