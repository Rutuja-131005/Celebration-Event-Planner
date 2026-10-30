import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError } from '../services/api.ts';
import { authService } from '../services/auth.ts';
import { eventsService } from '../services/events.ts';
import { budgetService } from '../services/budget.ts';
import { tasksService } from '../services/tasks.ts';
import { vendorsService } from '../services/vendors.ts';
import { planningService } from '../services/planning.ts';
import { predictionsService } from '../services/predictions.ts';

describe('Frontend Services & API Client Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('api client injects Authorization header when token exists and parses JSON response', async () => {
    localStorage.setItem('atelier_token', 'test-token-123');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { test: 123 } }),
    });

    const res = await api.get<{ success: boolean; data: { test: number } }>('/test');
    expect(res.success).toBe(true);
    expect(res.data.test).toBe(123);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('api client throws ApiError on non-200 responses with code and message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      }),
    });

    await expect(api.get('/protected')).rejects.toThrow('Access denied');
  });

  it('eventsService fetches and creates events', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        events: [{ id: 'evt_1', name: 'Test Event' }],
        event: { id: 'evt_1', name: 'Test Event' },
      }),
    });

    const list = await eventsService.getEvents();
    expect(list.events).toHaveLength(1);

    const single = await eventsService.getEvent('evt_1');
    expect(single.event.id).toBe('evt_1');

    const created = await eventsService.createEvent({
      name: 'New Event',
      eventType: 'Wedding',
      eventDate: '2026-12-12',
      location: 'Delhi',
      venueName: 'Palace',
      guestCount: 200,
      budgetAmount: 1500000,
    });
    expect(created.event.name).toBe('Test Event');
  });

  it('budgetService fetches categories and logs expenses', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        categories: [{ id: 'cat_1', categoryName: 'Catering' }],
        expenses: [{ id: 'exp_1', actualAmount: 50000 }],
        expense: { id: 'exp_1' },
      }),
    });

    const cats = await budgetService.getBudget('evt_1');
    expect(cats.categories).toHaveLength(1);

    const exps = await budgetService.getExpenses('evt_1');
    expect(exps.expenses).toHaveLength(1);

    const exp = await budgetService.createExpense('evt_1', {
      budgetCategoryId: 'cat_1',
      categoryName: 'Catering',
      voucherCode: 'VCH-1',
      description: 'Deposit',
      vendorName: 'Caterer',
      estimatedAmount: 50000,
      actualAmount: 50000,
      expenseDate: '2026-10-10',
    });
    expect(exp.expense.id).toBe('exp_1');

    await budgetService.deleteExpense('exp_1');
  });

  it('tasksService retrieves and mutates tasks', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        tasks: [{ id: 'tsk_1', title: 'Task 1', status: 'pending' }],
        task: { id: 'tsk_1', title: 'Task 1', status: 'completed' },
      }),
    });

    const tasks = await tasksService.getTasks('evt_1');
    expect(tasks.tasks).toHaveLength(1);

    const updated = await tasksService.updateTask('tsk_1', { status: 'completed' });
    expect(updated.task.status).toBe('completed');
  });

  it('vendorsService gets quotes and creates custom quotes', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        vendors: [{ id: 'ven_1', businessName: 'Vendor 1' }],
        quotes: [{ id: 'quo_1', quotedAmount: 200000 }],
        quote: { id: 'quo_1', quotedAmount: 200000 },
      }),
    });

    const vendors = await vendorsService.getVendors('Decorators');
    expect(vendors.vendors).toHaveLength(1);

    const quotes = await vendorsService.getQuotes('evt_1');
    expect(quotes.quotes).toHaveLength(1);

    const createdQuote = await vendorsService.createQuote('evt_1', {
      vendorName: 'Vendor 1',
      category: 'Decorators',
      quotedAmount: 200000,
    });
    expect(createdQuote.quote.id).toBe('quo_1');
  });

  it('planningService generates and applies AI blueprints', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        plans: [{ id: 'plan_1', versionNumber: 'v1.0' }],
        plan: { id: 'plan_1', versionNumber: 'v1.0' },
        categoriesUpdated: 5,
        tasksAdded: 12,
      }),
    });

    const plans = await planningService.getPlans('evt_1');
    expect(plans.plans).toHaveLength(1);

    const generated = await planningService.generatePlan('evt_1', 'Luxury wedding');
    expect(generated.plan.id).toBe('plan_1');

    const applied = await planningService.applyPlan('evt_1', 'plan_1');
    expect(applied.categoriesUpdated).toBe(5);
    expect(applied.tasksAdded).toBe(12);

    const replanned = await planningService.replan('evt_1', 'Add floral theme');
    expect(replanned.plan.id).toBe('plan_1');
  });

  it('predictionsService fetches metrics and runs scenarios', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        metrics: { baselineBudget: 2500000, committedAmount: 1680000 },
        prediction: { predictedValue: 2415000 },
        simulation: { netVariance: 22500, simulatedFinalOutlay: 2437500 },
        scenarios: [{ id: 'snap_1', guestShift: 15 }],
      }),
    });

    const prediction = await predictionsService.getLatestPrediction('evt_1');
    expect(prediction.prediction.predictedValue).toBe(2415000);

    const sim = await predictionsService.runScenario('evt_1', 15, 'couture', 'baseline', true);
    expect(sim.simulation.netVariance).toBe(22500);

    const snapshots = await predictionsService.getSavedScenarios('evt_1');
    expect(snapshots.scenarios).toHaveLength(1);
  });

  it('authService manages login, registration, and logout token state', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'auth-sec-token-999',
        user: { id: 'usr_1', email: 'test@example.com', role: 'Event Planner' },
      }),
    });

    const authRes = await authService.login('test@example.com', 'password123');
    expect(authRes.token).toBe('auth-sec-token-999');
    expect(localStorage.getItem('atelier_token')).toBe('auth-sec-token-999');

    const meRes = await authService.getMe();
    expect(meRes.user.email).toBe('test@example.com');

    await authService.logout();
    expect(localStorage.getItem('atelier_token')).toBeNull();
  });
});
