export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  ownerUserId: string;
  name: string;
  eventType: string;
  eventDate: string;
  location: string;
  venueName: string;
  guestCount: number;
  confirmedGuestCount: number;
  budgetAmount: number;
  currencyCode: string;
  theme: string;
  eventPreferences: Record<string, unknown>;
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'archived';
  daysRemaining: number;
  readinessScore: number;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  eventId: string;
  categoryName: string;
  plannedAmount: number;
  committedAmount: number;
  actualAmount: number;
  priority: 'high' | 'medium' | 'normal' | 'low';
  status: 'paid_100' | 'advance_50' | 'quoted' | 'booked' | 'in_progress' | 'pending';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  eventId: string;
  budgetCategoryId: string;
  categoryName: string;
  voucherCode: string;
  description: string;
  vendorName: string;
  estimatedAmount: number;
  actualAmount: number;
  expenseDate: string;
  paymentMethod: string;
  paymentStatus: 'settled' | 'drawdown_partial' | 'pending_invoice' | 'overdue';
  receiptRef?: string;
  isReconciled: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'normal' | 'routine';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo: string;
  dependencyTaskId?: string;
  dueLabel: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  serviceCategory: string;
  location: string;
  contactPerson: string;
  phone: string;
  email?: string;
  verificationStatus: 'verified' | 'certified' | 'under_review' | 'preferred';
  rating: number;
  reviewCount: number;
  avatarInitials: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorQuote {
  id: string;
  eventId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  quotedAmount: number;
  quoteDate: string;
  validUntil: string;
  bookingStatus: 'approved' | 'contract_signed' | 'deposit_pending' | 'under_review' | 'rejected';
  contractScope: string[];
  inclusions: string[];
  exclusions?: string[];
  paymentTerms: string;
  isAiRecommended?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIPlanVersion {
  id: string;
  eventId: string;
  versionNumber: string;
  versionTitle: string;
  curationConcept: string;
  eventType?: string;
  inputPrompt: string;
  planJson: {
    eventType?: string;
    aestheticFeasibilityScore: number;
    colorPalette: Array<{
      name: string;
      hex: string;
      usage: string;
    }>;
    spatialBlueprint: {
      headline: string;
      description: string;
      lightingArchitecture: string;
      olfactoryTactileSignature: string;
      decibelRegulations: string;
    };
    personalizedIdeas?: Array<{
      title: string;
      category: 'theme' | 'activity' | 'decor' | 'signature_moment' | 'entertainment';
      description: string;
      impact: string;
    }>;
    budgetRebalance: {
      totalBudget: number;
      categories?: Array<{
        name: string;
        amount: number;
        percentage: number;
        priority: 'high' | 'medium' | 'normal' | 'low';
        note: string;
      }>;
      // backward compatibility fields:
      catering?: { amount: number; percentage: number; note: string };
      decor?: { amount: number; percentage: number; note: string; belowCapSavings?: number };
      venueSound?: { amount: number; percentage: number; note: string };
      artistsChoreography?: { amount: number; percentage: number; note: string };
      contingencyReserve?: { amount: number; percentage: number; note: string };
      arbitrageInsight: string;
    };
    itinerary: Array<{
      time: string;
      title: string;
      locationTag: string;
      description: string;
      colorDot: string;
    }>;
    milestoneTimeline?: Array<{
      timeframe: string;
      milestone: string;
      description: string;
      priority: 'high' | 'medium' | 'normal';
    }>;
    vendorChecklist?: Array<{
      category: string;
      roleTitle: string;
      keyDeliverables: string[];
      estimatedAllocation: number;
      bookingWindow: string;
      status: 'recommended' | 'must_hire' | 'optional';
    }>;
    culinaryAteliers: Array<{
      title: string;
      categoryTag: string;
      description: string;
    }>;
  };
  isDevelopmentFallback: boolean;
  createdAt: string;
}

export interface Prediction {
  id: string;
  eventId: string;
  predictionType: 'cost_forecast' | 'budget_overrun' | 'turnout_projection' | 'logistics_surge';
  predictedValue: number;
  lowerEstimate: number;
  upperEstimate: number;
  riskProbability: number;
  modelVersion: string;
  confidenceScore: number;
  featureSnapshot: Record<string, unknown>;
  explanation: string;
  primaryVariable: {
    title: string;
    clause: string;
    status: string;
    description: string;
  };
  watchlistItems: Array<{
    title: string;
    badge: string;
    description: string;
    simulatedDeviation: string;
  }>;
  actionPlan: {
    title: string;
    description: string;
    potentialSavings: string;
    actionLabel: string;
  };
  createdAt: string;
}

export interface ScenarioSimulationResult {
  guestCountShift: number;
  decorTier: 'classic' | 'couture' | 'regal';
  barPackage: 'baseline' | 'vintage_champagne';
  netVariance: number;
  simulatedFinalOutlay: number;
  baselineBudget: number;
  contingencyRemaining: number;
  contingencyStatusText: string;
  isWithinBudget: boolean;
}

export interface BudgetMetrics {
  baselineBudget: number;
  plannedTotal: number;
  committedAmount: number;
  actualSpent: number;
  remainingBudget: number;
  committedPercentage: number;
  actualPercentage: number;
  contingencyPool: number;
  riskTier: 'low' | 'moderate' | 'elevated' | 'critical';
  forecastedTotal?: number;
  variance?: number;
}

export interface ScenarioSnapshot {
  id: string;
  eventId: string;
  title: string;
  guestShift: number;
  decorTier: string;
  barPackage: string;
  simulatedOutlay: number;
  variance: number;
  createdAt: string;
}

export interface CreateEventInput {
  name: string;
  eventType: string;
  eventDate: string;
  location: string;
  venueName: string;
  guestCount: number;
  budgetAmount: number;
  theme?: string;
  currencyCode?: string;
  eventPreferences?: Record<string, string | number | boolean>;
  autoGeneratePlan?: boolean;
  vibe?: string;
  ambiance?: string;
  culinaryStyle?: string;
  specialMoments?: string;
  colorPalette?: unknown;
  additionalNotes?: string;
  [key: string]: unknown;
}

export interface DashboardSummary {
  budgetSpent: number;
  budgetTotal: number;
  daysRemaining: number;
  readinessScore: number;
  taskCount: number;
  completedTasks: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
}

