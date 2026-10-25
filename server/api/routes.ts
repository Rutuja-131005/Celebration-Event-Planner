import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { predictionService } from '../services/predictionService.ts';
import { aiService } from '../services/aiService.ts';
import { runTestSuite } from '../tests/api.test.ts';

export const apiRouter = Router();

// Helper for consistent error responses
function handleError(res: Response, status: number, message: string, code = 'ERROR') {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}

// ==========================================
// 1. HEALTH CHECKS
// ==========================================
apiRouter.get('/health/live', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

apiRouter.get('/health/ready', (_req: Request, res: Response) => {
  res.json({
    status: 'ready',
    database: 'connected',
    environment: process.env.NODE_ENV || 'development',
    aiProvider: process.env.GEMINI_API_KEY ? 'gemini' : 'development-fallback',
  });
});

apiRouter.get('/tests/run', (_req: Request, res: Response) => {
  const result = runTestSuite();
  res.json(result);
});

// ==========================================
// 2. AUTHENTICATION
// ==========================================
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return handleError(res, 400, 'Name, email and password are required', 'VALIDATION_ERROR');
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return handleError(res, 409, 'User with this email already exists', 'CONFLICT');
  }

  const user = db.createUser({
    name,
    email,
    role: role || 'Event Planner',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  });

  // Return user info and simulated auth token
  const token = `atelier_token_${user.id}_${Date.now()}`;
  res.status(201).json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token,
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return handleError(res, 400, 'Email and password are required', 'VALIDATION_ERROR');
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // If logging in as Priya or demo user, resolve or create
    if (email === 'priya@atelier.com') {
      user = db.getUser('usr_priya_lead');
    }
  }

  if (!user) {
    return handleError(res, 401, 'Invalid credentials', 'UNAUTHORIZED');
  }

  const token = `atelier_token_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    token,
  });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let user = db.getUser('usr_priya_lead'); // default to Priya

  if (authHeader && authHeader.startsWith('Bearer atelier_token_')) {
    const parts = authHeader.replace('Bearer atelier_token_', '').split('_');
    const userId = `usr_${parts[0]}`;
    const found = db.getUser(userId);
    if (found) user = found;
  }

  if (!user) {
    return handleError(res, 401, 'Session invalid or expired', 'UNAUTHORIZED');
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  });
});

// ==========================================
// 3. DASHBOARD SUMMARY
// ==========================================
apiRouter.get('/dashboard/summary', (req: Request, res: Response) => {
  const eventId = (req.query.eventId as string) || 'evt_ananya_rohan';
  const event = db.getEvent(eventId);
  if (!event) return handleError(res, 404, 'Event not found');

  const budgetMetrics = predictionService.calculateBudgetMetrics(eventId);
  const tasks = db.getTasks(eventId);
  const prediction = predictionService.generatePrediction(eventId);
  const quotes = db.getVendorQuotes(eventId);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = 62; // Total milestone checklist
  const taskCompletionPct = Math.round((completedTasks / totalTasks) * 100);

  res.json({
    success: true,
    event,
    financialMetrics: {
      plannedBudget: budgetMetrics.baselineBudget,
      estimatedCost: budgetMetrics.forecastedTotal,
      surplusOrDeficit: budgetMetrics.variance,
      surplusPercentage: budgetMetrics.variancePercentage,
      committedSpent: budgetMetrics.committedAmount,
      committedPercentage: budgetMetrics.committedPercentage,
      freeCashFlow: budgetMetrics.freeCashFlow,
      contingencyPool: budgetMetrics.contingencyPool,
    },
    milestones: {
      completed: completedTasks,
      total: totalTasks,
      percentage: taskCompletionPct,
      dueSoon: tasks.filter((t) => t.status !== 'completed' && t.priority === 'high').length,
    },
    readinessRadar: [
      { pillar: 'Palace & Courtyard Venues', percentage: 100, note: 'Jagmandir, Zenana Mahal, Lawns' },
      { pillar: 'Catering & Beverage Menus', percentage: 90, note: 'Rajputana feasts · Final tasting passed' },
      { pillar: 'Decor & 3D Scenography', percentage: 85, note: 'Mandap renders approved; Florals in check' },
      { pillar: 'Boats, Shuttles & Concierge', percentage: 60, note: 'Jetty slips contracted; Airport shuttles open' },
    ],
    prediction,
    recentVendors: quotes.slice(0, 3),
  });
});

apiRouter.get('/dashboard/upcoming-events', (_req: Request, res: Response) => {
  const events = db.getEvents();
  res.json({ success: true, events });
});

apiRouter.get('/dashboard/next-actions', (req: Request, res: Response) => {
  const eventId = (req.query.eventId as string) || 'evt_ananya_rohan';
  const tasks = db.getTasks(eventId);
  res.json({
    success: true,
    tasks: tasks.filter((t) => t.status !== 'completed'),
  });
});

// ==========================================
// 4. EVENTS CRUD
// ==========================================
apiRouter.get('/events', (_req: Request, res: Response) => {
  const events = db.getEvents();
  res.json({ success: true, events });
});

apiRouter.post('/events', async (req: Request, res: Response) => {
  const {
    name,
    eventType,
    eventDate,
    location,
    venueName,
    guestCount,
    budgetAmount,
    theme,
    autoGeneratePlan = true,
    vibe,
    ambiance,
    culinaryStyle,
    specialMoments,
    colorPalette,
    additionalNotes,
  } = req.body;

  if (!name || !budgetAmount) {
    return handleError(res, 400, 'Name and budgetAmount are required', 'VALIDATION_ERROR');
  }

  const calculatedDays = eventDate
    ? Math.max(1, Math.round((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 60;

  const newEvent = db.createEvent({
    ownerUserId: 'usr_priya_lead',
    name,
    eventType: eventType || 'Bespoke Celebration',
    eventDate: eventDate || '2026-03-20',
    location: location || 'Rajasthan, India',
    venueName: venueName || 'Heritage Estate',
    guestCount: Number(guestCount) || 200,
    confirmedGuestCount: 0,
    budgetAmount: Number(budgetAmount),
    currencyCode: 'INR',
    theme: theme || 'Classic Atelier Elegance',
    eventPreferences: {
      vibe: vibe || 'Sophisticated & Memorable',
      ambiance: ambiance || 'Warm ambient glow with artisanal florals',
      culinaryStyle: culinaryStyle || 'Curated gourmet feast with signature cocktails',
      specialMoments: specialMoments || 'Champagne toast & live sensory reveals',
      colorPalette: colorPalette || 'Champagne Gold, Ivory & Velvet Plum',
      additionalNotes: additionalNotes || '',
    },
    status: 'planning',
    daysRemaining: calculatedDays,
    readinessScore: 40,
    code: `ATELIER-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
  });

  let generatedPlan = null;
  let planApplied = false;

  if (autoGeneratePlan) {
    try {
      const promptParts = [
        `Celebration Name: ${name}`,
        `Celebration Type: ${eventType || 'Bespoke Celebration'}`,
        `Location & Venue: ${venueName || 'Heritage Estate'}, ${location || 'Rajasthan, India'}`,
        `Guest Count: ${guestCount || 200} guests`,
        `Target Total Budget: ₹${Number(budgetAmount).toLocaleString('en-IN')}`,
        theme ? `Aesthetic Theme: ${theme}` : '',
        vibe ? `Vibe & Energy: ${vibe}` : '',
        ambiance ? `Sensory Atmosphere & Decor: ${ambiance}` : '',
        culinaryStyle ? `Culinary & Beverage Direction: ${culinaryStyle}` : '',
        specialMoments ? `Signature Highlights & Special Requests: ${specialMoments}` : '',
        colorPalette ? `Color Palette Preference: ${colorPalette}` : '',
        additionalNotes ? `Client Notes: ${additionalNotes}` : '',
      ].filter(Boolean).join('. ');

      const plan = await aiService.generatePlan(
        newEvent.id,
        promptParts,
        `${newEvent.name} - Complete Master Blueprint`,
        eventType
      );

      // Immediately apply the synthesized plan to populate budget categories & milestone tasks
      db.applyAIPlanToEvent(newEvent.id, plan.id);
      generatedPlan = plan;
      planApplied = true;
    } catch (planErr) {
      console.error('Auto-generate plan error:', planErr);
    }
  }

  const finalEvent = db.getEvent(newEvent.id) || newEvent;

  res.status(201).json({
    success: true,
    event: finalEvent,
    plan: generatedPlan,
    planApplied,
  });
});

apiRouter.get('/events/:id', (req: Request, res: Response) => {
  const event = db.getEvent(req.params.id);
  if (!event) return handleError(res, 404, 'Event not found');
  res.json({ success: true, event });
});

apiRouter.patch('/events/:id', (req: Request, res: Response) => {
  const updated = db.updateEvent(req.params.id, req.body);
  if (!updated) return handleError(res, 404, 'Event not found');
  res.json({ success: true, event: updated });
});

apiRouter.delete('/events/:id', (req: Request, res: Response) => {
  const ok = db.deleteEvent(req.params.id);
  if (!ok) return handleError(res, 404, 'Event not found');
  res.json({ success: true, message: 'Event deleted safely' });
});

// ==========================================
// 5. BUDGET AND EXPENSES
// ==========================================
apiRouter.get('/events/:id/budget', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const event = db.getEvent(eventId);
  if (!event) return handleError(res, 404, 'Event not found');

  const categories = db.getBudgetCategories(eventId);
  const metrics = predictionService.calculateBudgetMetrics(eventId);

  res.json({
    success: true,
    metrics,
    categories,
  });
});

apiRouter.put('/events/:id/budget', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const event = db.getEvent(eventId);
  if (!event) return handleError(res, 404, 'Event not found');

  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return handleError(res, 400, 'Categories must be an array');
  }

  const updated = db.setBudgetCategories(eventId, categories);
  const metrics = predictionService.calculateBudgetMetrics(eventId);
  res.json({ success: true, categories: updated, metrics });
});

apiRouter.get('/events/:id/expenses', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const expenses = db.getExpenses(eventId);
  res.json({ success: true, expenses, total: expenses.length });
});

apiRouter.post('/events/:id/expenses', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const event = db.getEvent(eventId);
  if (!event) return handleError(res, 404, 'Event not found');

  const {
    budgetCategoryId,
    categoryName,
    description,
    vendorName,
    actualAmount,
    expenseDate,
    paymentMethod,
    paymentStatus,
    receiptRef,
  } = req.body;

  if (!description || !actualAmount) {
    return handleError(res, 400, 'Description and actualAmount are required', 'VALIDATION_ERROR');
  }

  const newExpense = db.createExpense({
    eventId,
    budgetCategoryId: budgetCategoryId || 'cat_decor',
    categoryName: categoryName || 'Decor',
    voucherCode: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
    description,
    vendorName: vendorName || 'Atelier Partner',
    estimatedAmount: Number(actualAmount),
    actualAmount: Number(actualAmount),
    expenseDate: expenseDate || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Bank NEFT',
    paymentStatus: paymentStatus || 'settled',
    receiptRef: receiptRef || `REC-${Math.floor(100 + Math.random() * 900)}`,
    isReconciled: true,
  });

  const metrics = predictionService.calculateBudgetMetrics(eventId);
  res.status(201).json({ success: true, expense: newExpense, metrics });
});

apiRouter.patch('/expenses/:id', (req: Request, res: Response) => {
  const updated = db.updateExpense(req.params.id, req.body);
  if (!updated) return handleError(res, 404, 'Expense not found');
  res.json({ success: true, expense: updated });
});

apiRouter.delete('/expenses/:id', (req: Request, res: Response) => {
  const ok = db.deleteExpense(req.params.id);
  if (!ok) return handleError(res, 404, 'Expense not found');
  res.json({ success: true, message: 'Expense deleted' });
});

// ==========================================
// 6. TASKS
// ==========================================
apiRouter.get('/events/:id/tasks', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const tasks = db.getTasks(eventId);
  res.json({ success: true, tasks });
});

apiRouter.post('/events/:id/tasks', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { title, description, dueDate, priority, assignedTo, category } = req.body;

  if (!title) return handleError(res, 400, 'Title is required', 'VALIDATION_ERROR');

  const newTask = db.createTask({
    eventId,
    title,
    description: description || '',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    priority: priority || 'normal',
    status: 'pending',
    assignedTo: assignedTo || 'Priya Sharma',
    dueLabel: 'Upcoming',
    category: category || 'General',
  });

  res.status(201).json({ success: true, task: newTask });
});

apiRouter.patch('/tasks/:id', (req: Request, res: Response) => {
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return handleError(res, 404, 'Task not found');
  res.json({ success: true, task: updated });
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  const ok = db.deleteTask(req.params.id);
  if (!ok) return handleError(res, 404, 'Task not found');
  res.json({ success: true, message: 'Task deleted' });
});

// ==========================================
// 7. VENDORS & QUOTATIONS
// ==========================================
apiRouter.get('/events/:id/vendors', (_req: Request, res: Response) => {
  const vendors = db.getVendors();
  res.json({ success: true, vendors });
});

apiRouter.post('/events/:id/vendors', (req: Request, res: Response) => {
  const { name, serviceCategory, location, contactPerson, phone } = req.body;
  if (!name || !serviceCategory) {
    return handleError(res, 400, 'Name and serviceCategory are required', 'VALIDATION_ERROR');
  }

  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const newVendor = db.createVendor({
    name,
    serviceCategory,
    location: location || 'Udaipur, Rajasthan',
    contactPerson: contactPerson || 'Lead Representative',
    phone: phone || '+91 98000 00000',
    verificationStatus: 'verified',
    rating: 4.8,
    reviewCount: 12,
    avatarInitials: initials,
  });

  res.status(201).json({ success: true, vendor: newVendor });
});

apiRouter.get('/events/:id/vendor-quotes', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const quotes = db.getVendorQuotes(eventId);
  res.json({ success: true, quotes });
});

apiRouter.post('/events/:id/vendor-quotes', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { vendorId, vendorName, category, quotedAmount, validUntil, inclusions, paymentTerms } = req.body;

  if (!vendorName || !quotedAmount) {
    return handleError(res, 400, 'VendorName and quotedAmount are required', 'VALIDATION_ERROR');
  }

  const quote = db.createVendorQuote({
    eventId,
    vendorId: vendorId || 'vnd_custom',
    vendorName,
    category: category || 'Decor & Production',
    quotedAmount: Number(quotedAmount),
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: validUntil || '2025-12-31',
    bookingStatus: 'under_review',
    contractScope: [descriptionOrScope(req.body)],
    inclusions: Array.isArray(inclusions) ? inclusions : ['Standard atelier inclusions'],
    paymentTerms: paymentTerms || '25% Advance / 50% Mid / 25% Wrap',
  });

  res.status(201).json({ success: true, quote });
});

function descriptionOrScope(body: any): string {
  return body.notes || body.scope || 'Custom scope agreed between client and partner';
}

// ==========================================
// 8. AI PLANNING
// ==========================================
apiRouter.get('/events/:id/plans', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const plans = db.getAIPlans(eventId);
  res.json({ success: true, plans });
});

apiRouter.post('/events/:id/generate-plan', async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { prompt, customTitle, eventType } = req.body;

  if (!prompt) {
    return handleError(res, 400, 'Prompt description is required', 'VALIDATION_ERROR');
  }

  try {
    const plan = await aiService.generatePlan(eventId, prompt, customTitle, eventType);
    res.json({ success: true, plan });
  } catch (err: any) {
    handleError(res, 500, err.message || 'AI Plan synthesis failed');
  }
});

apiRouter.post('/events/:id/apply-ai-plan', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { planId } = req.body;

  if (!planId) {
    return handleError(res, 400, 'planId is required', 'VALIDATION_ERROR');
  }

  try {
    const result = db.applyAIPlanToEvent(eventId, planId);
    res.json(result);
  } catch (err: any) {
    handleError(res, 500, err.message || 'Failed to apply AI plan to event');
  }
});

apiRouter.post('/events/:id/replan', async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { adjustmentInstruction, eventType } = req.body;

  try {
    const existing = db.getAIPlans(eventId);
    const basePrompt = existing[0]?.inputPrompt || 'Bespoke event blueprint';
    const combinedPrompt = `${basePrompt} [Adjustment requested: ${adjustmentInstruction || 'Optimize parameters'}]`;

    const plan = await aiService.generatePlan(eventId, combinedPrompt, 'Adjusted Synthesis Checkpoint', eventType);
    res.json({ success: true, plan });
  } catch (err: any) {
    handleError(res, 500, err.message || 'Replanning failed');
  }
});

// ==========================================
// 9. PREDICTIVE ANALYTICS & SCENARIOS
// ==========================================
apiRouter.get('/events/:id/predictions/latest', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const prediction = predictionService.generatePrediction(eventId);
  res.json({ success: true, prediction });
});

apiRouter.post('/events/:id/predict', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const prediction = predictionService.generatePrediction(eventId);
  res.json({ success: true, prediction });
});

apiRouter.post('/events/:id/scenarios', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { guestShift, decorTier, barPackage, saveSnapshot, title } = req.body;

  const result = predictionService.simulateScenario(
    eventId,
    Number(guestShift) || 0,
    decorTier || 'couture',
    barPackage || 'baseline'
  );

  let savedItem = null;
  if (saveSnapshot) {
    savedItem = db.saveScenario({
      eventId,
      title: title || `Scenario (${guestShift >= 0 ? '+' : ''}${guestShift} Guests, ${decorTier})`,
      guestShift: Number(guestShift) || 0,
      decorTier: decorTier || 'couture',
      barPackage: barPackage || 'baseline',
      simulatedOutlay: result.simulatedFinalOutlay,
      variance: result.netVariance,
    });
  }

  res.json({ success: true, simulation: result, savedSnapshot: savedItem });
});

apiRouter.get('/events/:id/scenarios', (req: Request, res: Response) => {
  const list = db.getScenarios(req.params.id);
  res.json({ success: true, scenarios: list });
});

// ==========================================
// 10. REPORTS
// ==========================================
apiRouter.get('/events/:id/reports/summary', (req: Request, res: Response) => {
  const eventId = req.params.id;
  const event = db.getEvent(eventId);
  if (!event) return handleError(res, 404, 'Event not found');

  const budget = predictionService.calculateBudgetMetrics(eventId);
  const categories = db.getBudgetCategories(eventId);
  const tasks = db.getTasks(eventId);
  const quotes = db.getVendorQuotes(eventId);
  const latestPlan = db.getAIPlans(eventId)[0];
  const prediction = predictionService.generatePrediction(eventId);

  res.json({
    success: true,
    report: {
      generatedAt: new Date().toISOString(),
      event,
      budget,
      categories,
      tasks: {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        pending: tasks.filter((t) => t.status !== 'completed').length,
      },
      vendors: {
        totalQuotes: quotes.length,
        approved: quotes.filter((q) => q.bookingStatus === 'approved' || q.bookingStatus === 'contract_signed').length,
      },
      latestPlanVersion: latestPlan?.versionNumber || 'v1.0',
      prediction,
    },
  });
});
