import { Router, Request, Response } from 'express';
import { db } from '../db/database.ts';
import { predictionService } from '../services/predictionService.ts';
import { aiService } from '../services/aiService.ts';
import { runTestSuite } from '../tests/api.test.ts';
import {
  hashPassword,
  verifyPassword,
  createToken,
  requireAuth,
  optionalAuth,
  sanitizeText,
  validateNumber,
  createRateLimiter,
  AuthenticatedRequest,
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLogins,
  revokeToken,
  DUMMY_PASSWORD_HASH,
} from '../utils/security.ts';
import { auditLogger } from '../utils/auditLogger.ts';
import {
  validateBody,
  authRegisterSchema,
  authLoginSchema,
  createEventSchema,
  createExpenseSchema,
  createQuoteSchema,
  createTaskSchema,
  simulateScenarioSchema,
} from '../validation/schemas.ts';
import { serverLogger } from '../utils/logger.ts';
import { BudgetCategory } from '../models/types.ts';

export const apiRouter = Router();

// Rate limiters for sensitive operations
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Too many authentication attempts. Please try again after a few minutes.',
});

const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: 'AI plan generation rate limit exceeded. Please wait a minute before requesting another synthesis.',
});

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
// 1. HEALTH CHECKS & DIAGNOSTICS
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
// 2. AUTHENTICATION & ACCESS SESSIONS
// ==========================================
apiRouter.post('/auth/register', authRateLimiter, validateBody(authRegisterSchema), (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const cleanName = sanitizeText(name, 100);
  const cleanEmail = sanitizeText(email, 150).toLowerCase();

  const existing = db.getUserByEmail(cleanEmail);
  if (existing) {
    return handleError(res, 409, 'User with this email already exists', 'CONFLICT');
  }

  // Restrict self-assigned role to prevent unauthorized privilege escalation
  const allowedRoles = ['Event Planner', 'Client'];
  const assignedRole = allowedRoles.includes(role) ? role : 'Event Planner';

  const user = db.createUser({
    name: cleanName,
    email: cleanEmail,
    role: assignedRole,
    passwordHash: hashPassword(password),
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
  });

  auditLogger.log({
    eventType: 'AUTH_REGISTER',
    userId: user.id,
    ip: req.socket.remoteAddress,
    status: 'SUCCESS',
    details: { email: cleanEmail, role: assignedRole },
  });

  const token = createToken(user);
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

apiRouter.post('/auth/login', authRateLimiter, validateBody(authLoginSchema), (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = email.trim().toLowerCase();

  // Check account lockout status
  const lockout = checkAccountLockout(cleanEmail);
  if (lockout.isLocked) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to repeated failed login attempts. Please retry in ${lockout.remainingSeconds}s.`,
      },
    });
  }

  let user = db.getUserByEmail(cleanEmail);

  if (!user && (cleanEmail === 'rutuja@atelier.com' || cleanEmail === 'priya@atelier.com')) {
    user = db.getUser('usr_priya_lead');
  }

  // Generic message and constant-time password check prevents username/account enumeration attacks
  const hashToVerify = user ? user.passwordHash : DUMMY_PASSWORD_HASH;
  const isPasswordValid = verifyPassword(password, hashToVerify);

  if (!user || !isPasswordValid) {
    const failed = recordFailedLogin(cleanEmail);
    auditLogger.log({
      eventType: 'AUTH_LOGIN_FAILURE',
      ip: req.socket.remoteAddress,
      status: failed.isLocked ? 'ALERT' : 'WARNING',
      details: { email: cleanEmail, attemptsLeft: failed.remainingAttempts },
    });

    if (failed.isLocked) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'Too many failed login attempts. Account temporarily locked for 15 minutes.',
        },
      });
    }

    return handleError(res, 401, 'Invalid email or password', 'UNAUTHORIZED');
  }

  // Successful login resets failed attempts
  resetFailedLogins(cleanEmail);

  auditLogger.log({
    eventType: 'AUTH_LOGIN_SUCCESS',
    userId: user.id,
    ip: req.socket.remoteAddress,
    status: 'SUCCESS',
    details: { email: cleanEmail, role: user.role },
  });

  const token = createToken(user);
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

apiRouter.post('/auth/logout', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.tokenJti) {
    revokeToken(req.tokenJti, req.tokenExp);
  }
  auditLogger.log({
    eventType: 'AUTH_LOGOUT',
    userId: req.user?.id,
    ip: req.socket.remoteAddress,
    status: 'SUCCESS',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/auth/audit-logs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Lead Planner' && req.user?.role !== 'Event Planner') {
    return handleError(res, 403, 'Permission denied', 'FORBIDDEN');
  }
  res.json({ success: true, logs: auditLogger.getRecentLogs() });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
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
apiRouter.get('/dashboard/summary', optionalAuth, (req: Request, res: Response) => {
  const eventId = sanitizeText(req.query.eventId, 50) || 'evt_ananya_rohan';
  const event = db.getEvent(eventId);
  if (!event) return handleError(res, 404, 'Event not found');

  const budgetMetrics = predictionService.calculateBudgetMetrics(eventId);
  const tasks = db.getTasks(eventId);
  const prediction = predictionService.generatePrediction(eventId);
  const quotes = db.getVendorQuotes(eventId);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = 62;
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

apiRouter.get('/dashboard/upcoming-events', optionalAuth, (_req: Request, res: Response) => {
  const events = db.getEvents();
  res.json({ success: true, events });
});

apiRouter.get('/dashboard/next-actions', optionalAuth, (req: Request, res: Response) => {
  const eventId = sanitizeText(req.query.eventId, 50) || 'evt_ananya_rohan';
  const tasks = db.getTasks(eventId);
  res.json({
    success: true,
    tasks: tasks.filter((t) => t.status !== 'completed'),
  });
});

// ==========================================
// 4. EVENTS CRUD
// ==========================================
apiRouter.get('/events', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const events = db.getEvents();
  res.json({ success: true, events });
});

apiRouter.post('/events', requireAuth, validateBody(createEventSchema), async (req: AuthenticatedRequest, res: Response) => {
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

  const cleanName = sanitizeText(name, 120);
  const validBudget = validateNumber(budgetAmount, 1000, 1000000000, 0);

  if (!cleanName || validBudget <= 0) {
    return handleError(res, 400, 'A valid event name and positive budgetAmount are required', 'VALIDATION_ERROR');
  }

  const validGuestCount = Math.round(validateNumber(guestCount, 1, 100000, 200));

  const calculatedDays = eventDate
    ? Math.max(1, Math.round((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 60;

  const currentUserId = req.user?.id || 'usr_priya_lead';

  const newEvent = db.createEvent({
    ownerUserId: currentUserId,
    name: cleanName,
    eventType: sanitizeText(eventType, 80) || 'Bespoke Celebration',
    eventDate: sanitizeText(eventDate, 30) || '2026-03-20',
    location: sanitizeText(location, 100) || 'Rajasthan, India',
    venueName: sanitizeText(venueName, 120) || 'Heritage Estate',
    guestCount: validGuestCount,
    confirmedGuestCount: 0,
    budgetAmount: validBudget,
    currencyCode: 'INR',
    theme: sanitizeText(theme, 100) || 'Classic Atelier Elegance',
    eventPreferences: {
      vibe: sanitizeText(vibe, 150) || 'Sophisticated & Memorable',
      ambiance: sanitizeText(ambiance, 200) || 'Warm ambient glow with artisanal florals',
      culinaryStyle: sanitizeText(culinaryStyle, 200) || 'Curated gourmet feast with signature cocktails',
      specialMoments: sanitizeText(specialMoments, 200) || 'Champagne toast & live sensory reveals',
      colorPalette: sanitizeText(colorPalette, 150) || 'Champagne Gold, Ivory & Velvet Plum',
      additionalNotes: sanitizeText(additionalNotes, 500) || '',
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
        `Celebration Name: ${newEvent.name}`,
        `Celebration Type: ${newEvent.eventType}`,
        `Location & Venue: ${newEvent.venueName}, ${newEvent.location}`,
        `Guest Count: ${newEvent.guestCount} guests`,
        `Target Total Budget: ₹${newEvent.budgetAmount.toLocaleString('en-IN')}`,
        newEvent.theme ? `Aesthetic Theme: ${newEvent.theme}` : '',
        newEvent.eventPreferences?.vibe ? `Vibe & Energy: ${newEvent.eventPreferences.vibe}` : '',
        newEvent.eventPreferences?.ambiance ? `Sensory Atmosphere & Decor: ${newEvent.eventPreferences.ambiance}` : '',
        newEvent.eventPreferences?.culinaryStyle ? `Culinary & Beverage Direction: ${newEvent.eventPreferences.culinaryStyle}` : '',
        newEvent.eventPreferences?.specialMoments ? `Signature Highlights & Special Requests: ${newEvent.eventPreferences.specialMoments}` : '',
        newEvent.eventPreferences?.colorPalette ? `Color Palette Preference: ${newEvent.eventPreferences.colorPalette}` : '',
        newEvent.eventPreferences?.additionalNotes ? `Client Notes: ${newEvent.eventPreferences.additionalNotes}` : '',
      ].filter(Boolean).join('. ');

      const plan = await aiService.generatePlan(
        newEvent.id,
        promptParts,
        `${newEvent.name} - Complete Master Blueprint`,
        newEvent.eventType
      );

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

apiRouter.get('/events/:id', optionalAuth, (req: Request, res: Response) => {
  const event = db.getEvent(req.params.id);
  if (!event) return handleError(res, 404, 'Event not found');
  res.json({ success: true, event });
});

apiRouter.patch('/events/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getEvent(req.params.id);
  if (!existing) return handleError(res, 404, 'Event not found');

  // Verify ownership or Lead Planner role
  const isLead = req.user?.role === 'Lead Planner';
  const isOwner = existing.ownerUserId === req.user?.id;
  if (!isLead && !isOwner) {
    return handleError(res, 403, 'Permission denied. Only event owners or Lead Planners can update event settings.', 'FORBIDDEN');
  }

  // Whitelist safe updatable fields to prevent mass assignment
  const allowedFields = [
    'name',
    'eventType',
    'eventDate',
    'location',
    'venueName',
    'guestCount',
    'confirmedGuestCount',
    'budgetAmount',
    'theme',
    'eventPreferences',
    'status',
    'daysRemaining',
    'readinessScore',
  ];

  const safeUpdates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in req.body) {
      if (typeof req.body[field] === 'string') {
        safeUpdates[field] = sanitizeText(req.body[field], 500);
      } else if (typeof req.body[field] === 'number') {
        safeUpdates[field] = validateNumber(req.body[field], 0, 1000000000, existing[field as keyof typeof existing] as number);
      } else {
        safeUpdates[field] = req.body[field];
      }
    }
  }

  const updated = db.updateEvent(req.params.id, safeUpdates);
  res.json({ success: true, event: updated });
});

apiRouter.delete('/events/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getEvent(req.params.id);
  if (!existing) return handleError(res, 404, 'Event not found');

  const isLead = req.user?.role === 'Lead Planner';
  const isOwner = existing.ownerUserId === req.user?.id;
  if (!isLead && !isOwner) {
    return handleError(res, 403, 'Permission denied. Only event owners or Lead Planners can delete an event.', 'FORBIDDEN');
  }

  const ok = db.deleteEvent(req.params.id);
  if (!ok) return handleError(res, 404, 'Event not found');
  res.json({ success: true, message: 'Event deleted safely' });
});

// ==========================================
// 5. BUDGET AND EXPENSES
// ==========================================
apiRouter.get('/events/:id/budget', optionalAuth, (req: Request, res: Response) => {
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

apiRouter.put('/events/:id/budget', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const event = db.getEvent(eventId);
  if (!event) return handleError(res, 404, 'Event not found');

  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return handleError(res, 400, 'Categories must be an array', 'VALIDATION_ERROR');
  }

  const sanitizedCategories: Omit<BudgetCategory, 'createdAt' | 'eventId' | 'id' | 'updatedAt'>[] = categories.map((cat: Record<string, unknown>) => {
    const rawPriority = typeof cat.priority === 'string' ? cat.priority : 'normal';
    const priority: 'high' | 'medium' | 'normal' | 'low' = ['high', 'medium', 'normal', 'low'].includes(rawPriority)
      ? (rawPriority as 'high' | 'medium' | 'normal' | 'low')
      : 'normal';

    const rawStatus = typeof cat.status === 'string' ? cat.status : 'pending';
    const status: 'paid_100' | 'advance_50' | 'quoted' | 'booked' | 'in_progress' | 'pending' = [
      'paid_100',
      'advance_50',
      'quoted',
      'booked',
      'in_progress',
      'pending',
    ].includes(rawStatus)
      ? (rawStatus as 'paid_100' | 'advance_50' | 'quoted' | 'booked' | 'in_progress' | 'pending')
      : 'pending';

    return {
      categoryName: sanitizeText(typeof cat.categoryName === 'string' ? cat.categoryName : '', 80) || 'General Category',
      plannedAmount: validateNumber(cat.plannedAmount, 0, 1000000000, 0),
      committedAmount: validateNumber(cat.committedAmount, 0, 1000000000, 0),
      actualAmount: validateNumber(cat.actualAmount, 0, 1000000000, 0),
      priority,
      status,
      notes: sanitizeText(typeof cat.notes === 'string' ? cat.notes : '', 200),
    };
  });

  const updated = db.setBudgetCategories(eventId, sanitizedCategories);
  const metrics = predictionService.calculateBudgetMetrics(eventId);
  res.json({ success: true, categories: updated, metrics });
});

apiRouter.get('/events/:id/expenses', optionalAuth, (req: Request, res: Response) => {
  const eventId = req.params.id;
  const expenses = db.getExpenses(eventId);
  res.json({ success: true, expenses, total: expenses.length });
});

apiRouter.post('/events/:id/expenses', requireAuth, validateBody(createExpenseSchema), (req: AuthenticatedRequest, res: Response) => {
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

  const validAmount = validateNumber(actualAmount, 0.01, 1000000000, 0);
  const cleanDescription = sanitizeText(description, 200);

  if (!cleanDescription || validAmount <= 0) {
    return handleError(res, 400, 'Description and a positive actualAmount are required', 'VALIDATION_ERROR');
  }

  const newExpense = db.createExpense({
    eventId,
    budgetCategoryId: sanitizeText(budgetCategoryId, 50) || 'cat_decor',
    categoryName: sanitizeText(categoryName, 80) || 'Decor',
    voucherCode: `TRX-${Math.floor(1000 + Math.random() * 9000)}`,
    description: cleanDescription,
    vendorName: sanitizeText(vendorName, 100) || 'Atelier Partner',
    estimatedAmount: validAmount,
    actualAmount: validAmount,
    expenseDate: sanitizeText(expenseDate, 30) || new Date().toISOString().split('T')[0],
    paymentMethod: sanitizeText(paymentMethod, 50) || 'Bank NEFT',
    paymentStatus: ['settled', 'drawdown_partial', 'pending_invoice', 'overdue'].includes(paymentStatus)
      ? paymentStatus
      : 'settled',
    receiptRef: sanitizeText(receiptRef, 50) || `REC-${Math.floor(100 + Math.random() * 900)}`,
    isReconciled: true,
  });

  const metrics = predictionService.calculateBudgetMetrics(eventId);
  res.status(201).json({ success: true, expense: newExpense, metrics });
});

apiRouter.patch('/expenses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const allowed = ['description', 'actualAmount', 'estimatedAmount', 'paymentStatus', 'paymentMethod', 'notes'];
  const safeUpdates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (field in req.body) {
      if (typeof req.body[field] === 'string') {
        safeUpdates[field] = sanitizeText(req.body[field], 200);
      } else if (typeof req.body[field] === 'number') {
        safeUpdates[field] = validateNumber(req.body[field], 0, 1000000000, 0);
      }
    }
  }

  const updated = db.updateExpense(req.params.id, safeUpdates);
  if (!updated) return handleError(res, 404, 'Expense not found');
  res.json({ success: true, expense: updated });
});

apiRouter.delete('/expenses/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteExpense(req.params.id);
  if (!ok) return handleError(res, 404, 'Expense not found');
  res.json({ success: true, message: 'Expense deleted' });
});

// ==========================================
// 6. TASKS
// ==========================================
apiRouter.get('/events/:id/tasks', optionalAuth, (req: Request, res: Response) => {
  const eventId = req.params.id;
  const tasks = db.getTasks(eventId);
  res.json({ success: true, tasks });
});

apiRouter.post('/events/:id/tasks', requireAuth, validateBody(createTaskSchema), (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const { title, description, dueDate, priority, assignedTo, category } = req.body;

  const cleanTitle = sanitizeText(title, 150);
  if (!cleanTitle) return handleError(res, 400, 'Title is required', 'VALIDATION_ERROR');

  const newTask = db.createTask({
    eventId,
    title: cleanTitle,
    description: sanitizeText(description, 500) || '',
    dueDate: sanitizeText(dueDate, 30) || new Date().toISOString().split('T')[0],
    priority: ['high', 'medium', 'normal', 'routine'].includes(priority) ? priority : 'normal',
    status: 'pending',
    assignedTo: sanitizeText(assignedTo, 80) || 'Rutuja Jadhav',
    dueLabel: 'Upcoming',
    category: sanitizeText(category, 60) || 'General',
  });

  res.status(201).json({ success: true, task: newTask });
});

apiRouter.patch('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const allowed = ['title', 'description', 'dueDate', 'priority', 'status', 'assignedTo', 'category'];
  const safeUpdates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (field in req.body) {
      safeUpdates[field] = sanitizeText(req.body[field], 300);
    }
  }

  const updated = db.updateTask(req.params.id, safeUpdates);
  if (!updated) return handleError(res, 404, 'Task not found');
  res.json({ success: true, task: updated });
});

apiRouter.delete('/tasks/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const ok = db.deleteTask(req.params.id);
  if (!ok) return handleError(res, 404, 'Task not found');
  res.json({ success: true, message: 'Task deleted' });
});

// ==========================================
// 7. VENDORS & QUOTATIONS
// ==========================================
apiRouter.get('/events/:id/vendors', optionalAuth, (_req: Request, res: Response) => {
  const vendors = db.getVendors();
  res.json({ success: true, vendors });
});

apiRouter.post('/events/:id/vendors', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { name, serviceCategory, location, contactPerson, phone } = req.body;
  const cleanName = sanitizeText(name, 100);
  const cleanCategory = sanitizeText(serviceCategory, 80);

  if (!cleanName || !cleanCategory) {
    return handleError(res, 400, 'Name and serviceCategory are required', 'VALIDATION_ERROR');
  }

  const initials = cleanName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const newVendor = db.createVendor({
    name: cleanName,
    serviceCategory: cleanCategory,
    location: sanitizeText(location, 100) || 'Udaipur, Rajasthan',
    contactPerson: sanitizeText(contactPerson, 80) || 'Lead Representative',
    phone: sanitizeText(phone, 30) || '+91 98000 00000',
    verificationStatus: 'verified',
    rating: 4.8,
    reviewCount: 12,
    avatarInitials: initials,
  });

  res.status(201).json({ success: true, vendor: newVendor });
});

apiRouter.get('/events/:id/vendor-quotes', optionalAuth, (req: Request, res: Response) => {
  const eventId = req.params.id;
  const quotes = db.getVendorQuotes(eventId);
  res.json({ success: true, quotes });
});

apiRouter.post('/events/:id/vendor-quotes', requireAuth, validateBody(createQuoteSchema), (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const { vendorId, vendorName, category, quotedAmount, validUntil, inclusions, paymentTerms } = req.body;

  const cleanVendorName = sanitizeText(vendorName, 100);
  const validAmount = validateNumber(quotedAmount, 0.01, 1000000000, 0);

  if (!cleanVendorName || validAmount <= 0) {
    return handleError(res, 400, 'VendorName and a positive quotedAmount are required', 'VALIDATION_ERROR');
  }

  const quote = db.createVendorQuote({
    eventId,
    vendorId: sanitizeText(vendorId, 50) || 'vnd_custom',
    vendorName: cleanVendorName,
    category: sanitizeText(category, 80) || 'Decor & Production',
    quotedAmount: validAmount,
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: sanitizeText(validUntil, 30) || '2025-12-31',
    bookingStatus: 'under_review',
    contractScope: [descriptionOrScope(req.body as Record<string, unknown>)],
    inclusions: Array.isArray(inclusions)
      ? inclusions.map((i: unknown) => sanitizeText(typeof i === 'string' ? i : '', 200))
      : ['Standard atelier inclusions'],
    paymentTerms: sanitizeText(paymentTerms, 100) || '25% Advance / 50% Mid / 25% Wrap',
  });

  res.status(201).json({ success: true, quote });
});

function descriptionOrScope(body: Record<string, unknown>): string {
  const raw = (typeof body.notes === 'string' ? body.notes : null) || (typeof body.scope === 'string' ? body.scope : null) || 'Custom scope agreed between client and partner';
  return sanitizeText(raw, 300);
}

// ==========================================
// 8. AI PLANNING & PROMPT-SAFE SYNTHESIS
// ==========================================
apiRouter.get('/events/:id/plans', optionalAuth, (req: Request, res: Response) => {
  const eventId = req.params.id;
  const plans = db.getAIPlans(eventId);
  res.json({ success: true, plans });
});

apiRouter.post('/events/:id/generate-plan', aiRateLimiter, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const { prompt, customTitle, eventType } = req.body;

  const cleanPrompt = sanitizeText(prompt, 1000);
  if (!cleanPrompt) {
    return handleError(res, 400, 'Prompt description is required', 'VALIDATION_ERROR');
  }

  try {
    const plan = await aiService.generatePlan(
      eventId,
      cleanPrompt,
      sanitizeText(customTitle, 100),
      sanitizeText(eventType, 50)
    );
    res.json({ success: true, plan });
  } catch (err: unknown) {
    serverLogger.error('Plan generation failed', 'Routes', { error: err instanceof Error ? err.message : String(err) });
    handleError(res, 500, 'AI Plan synthesis failed. Please try again.');
  }
});

apiRouter.post('/events/:id/apply-ai-plan', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const { planId } = req.body;

  if (!planId) {
    return handleError(res, 400, 'planId is required', 'VALIDATION_ERROR');
  }

  try {
    const result = db.applyAIPlanToEvent(eventId, sanitizeText(planId, 60));
    res.json(result);
  } catch (err: unknown) {
    serverLogger.error('Apply AI plan error', 'Routes', { error: err instanceof Error ? err.message : String(err) });
    handleError(res, 500, 'Failed to apply AI plan to event');
  }
});

apiRouter.post('/events/:id/replan', aiRateLimiter, requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const { adjustmentInstruction, eventType } = req.body;

  const cleanInstruction = sanitizeText(adjustmentInstruction, 500);

  try {
    const existing = db.getAIPlans(eventId);
    const basePrompt = existing[0]?.inputPrompt || 'Bespoke event blueprint';
    const combinedPrompt = `${basePrompt} [Adjustment requested: ${cleanInstruction || 'Optimize parameters'}]`.substring(
      0,
      1000
    );

    const plan = await aiService.generatePlan(
      eventId,
      combinedPrompt,
      'Adjusted Synthesis Checkpoint',
      sanitizeText(eventType, 50)
    );
    res.json({ success: true, plan });
  } catch (err: unknown) {
    serverLogger.error('Replanning error', 'Routes', { error: err instanceof Error ? err.message : String(err) });
    handleError(res, 500, 'Replanning failed');
  }
});

// ==========================================
// 9. PREDICTIVE ANALYTICS & SCENARIOS
// ==========================================
apiRouter.get('/events/:id/predictions/latest', optionalAuth, (req: Request, res: Response) => {
  const eventId = req.params.id;
  const prediction = predictionService.generatePrediction(eventId);
  res.json({ success: true, prediction });
});

apiRouter.post('/events/:id/predict', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const eventId = req.params.id;
  const prediction = predictionService.generatePrediction(eventId);
  res.json({ success: true, prediction });
});

apiRouter.post('/events/:id/scenarios', optionalAuth, validateBody(simulateScenarioSchema), (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { guestShift, decorTier, barPackage, saveSnapshot, title } = req.body;

  const validShift = Math.round(validateNumber(guestShift, -500, 1000, 0));
  const validDecorTier: 'classic' | 'couture' | 'regal' = (decorTier === 'classic' || decorTier === 'couture' || decorTier === 'regal') ? decorTier : 'couture';
  const validBarPackage: 'baseline' | 'vintage_champagne' = (barPackage === 'baseline' || barPackage === 'vintage_champagne') ? barPackage : 'baseline';

  const result = predictionService.simulateScenario(
    eventId,
    validShift,
    validDecorTier,
    validBarPackage
  );

  let savedItem = null;
  if (saveSnapshot) {
    savedItem = db.saveScenario({
      eventId,
      title: sanitizeText(title, 100) || `Scenario (${validShift >= 0 ? '+' : ''}${validShift} Guests, ${validDecorTier})`,
      guestShift: validShift,
      decorTier: validDecorTier,
      barPackage: validBarPackage,
      simulatedOutlay: result.simulatedFinalOutlay,
      variance: result.netVariance,
    });
  }

  res.json({ success: true, simulation: result, savedSnapshot: savedItem });
});

apiRouter.get('/events/:id/scenarios', optionalAuth, (req: Request, res: Response) => {
  const list = db.getScenarios(req.params.id);
  res.json({ success: true, scenarios: list });
});

// ==========================================
// 10. AUDIT & EXECUTIVE REPORTS
// ==========================================
apiRouter.get('/events/:id/reports/summary', optionalAuth, (req: Request, res: Response) => {
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
