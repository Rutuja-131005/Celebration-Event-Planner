import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise Zod validation schemas with strict mode to prevent mass assignment / parameter injection
 */

export const authRegisterSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    email: z.string().trim().email('Invalid email address format').max(150),
    password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
    role: z.enum(['Event Planner', 'Client', 'Lead Planner']).optional(),
  })
  .strict();

export const authLoginSchema = z
  .object({
    email: z.string().trim().email('Invalid email address format').max(150),
    password: z.string().min(1, 'Password is required').max(128),
  })
  .strict();

export const createEventSchema = z
  .object({
    name: z.string().trim().min(1, 'Event name is required').max(150),
    eventType: z.string().trim().max(100).optional(),
    eventDate: z.string().trim().max(50).optional(),
    location: z.string().trim().max(150).optional(),
    venueName: z.string().trim().max(150).optional(),
    guestCount: z.number().int().positive().max(100_000).optional(),
    budgetAmount: z.number().positive('Total budget must be a positive number').max(1_000_000_000),
    theme: z.string().trim().max(150).optional(),
    autoGeneratePlan: z.boolean().optional(),
    vibe: z.string().trim().max(200).optional(),
    ambiance: z.string().trim().max(300).optional(),
    culinaryStyle: z.string().trim().max(300).optional(),
    specialMoments: z.string().trim().max(300).optional(),
    colorPalette: z.string().trim().max(200).optional(),
    additionalNotes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const createExpenseSchema = z
  .object({
    budgetCategoryId: z.string().trim().max(50).optional(),
    categoryName: z.string().trim().max(100).optional(),
    description: z.string().trim().min(1, 'Description is required').max(500),
    vendorName: z.string().trim().max(150).optional(),
    actualAmount: z.number().positive('Expense amount must be positive').max(1_000_000_000),
    expenseDate: z.string().trim().max(50).optional(),
    paymentMethod: z.string().trim().max(50).optional(),
    paymentStatus: z.enum(['settled', 'drawdown_partial', 'pending_invoice', 'overdue']).optional(),
    receiptRef: z.string().trim().max(50).optional(),
  })
  .strict();

export const createQuoteSchema = z
  .object({
    vendorId: z.string().trim().max(50).optional(),
    vendorName: z.string().trim().min(1, 'Vendor name is required').max(150),
    category: z.string().trim().max(100).optional(),
    quotedAmount: z.number().positive('Quoted amount must be positive').max(1_000_000_000),
    validUntil: z.string().trim().max(50).optional(),
    paymentTerms: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(1000).optional(),
    scope: z.string().trim().max(1000).optional(),
    inclusions: z.array(z.string().max(200)).optional(),
  })
  .strict();

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'Task title is required').max(200),
    description: z.string().trim().max(1000).optional(),
    dueDate: z.string().trim().max(50).optional(),
    priority: z.enum(['high', 'medium', 'normal', 'routine']).optional(),
    assignedTo: z.string().trim().max(100).optional(),
    category: z.string().trim().max(100).optional(),
  })
  .strict();

export const simulateScenarioSchema = z
  .object({
    guestShift: z.number().min(-500).max(1000).optional(),
    decorTier: z.enum(['classic', 'couture', 'regal']).optional(),
    barPackage: z.enum(['baseline', 'vintage_champagne']).optional(),
    saveSnapshot: z.boolean().optional(),
    title: z.string().trim().max(200).optional(),
  })
  .strict();

/**
 * Reusable Express request body validation middleware
 */
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: messages || 'Invalid request payload',
        },
      });
    }
    req.body = result.data;
    next();
  };
}
