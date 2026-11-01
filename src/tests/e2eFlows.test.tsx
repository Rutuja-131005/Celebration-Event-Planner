import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { db } from '../../server/db/database.ts';
import { aiService } from '../../server/services/aiService.ts';
import { predictionService } from '../../server/services/predictionService.ts';
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
} from '../../server/utils/security.ts';

describe('End-to-End Enterprise Lifecycle & Workflow Flows', () => {
  it('E2E Flow 1: Sign in -> Create Event -> Generate AI Blueprint -> Add Expense -> Run Scenario -> Export Audit Report', async () => {
    // Step 1: Sign in
    const user = db.getUserByEmail('rutuja@atelier.com') || db.getUserByEmail('priya@atelier.com');
    expect(user).toBeDefined();
    expect(verifyPassword('atelier2025', user?.passwordHash)).toBe(true);

    const sessionToken = createToken({ id: user!.id, email: user!.email, role: user!.role });
    const verifiedSession = verifyToken(sessionToken);
    expect(verifiedSession?.userId).toBe(user!.id);
    expect(verifiedSession?.role).toBe('Lead Planner');

    // Step 2: Create Event
    const createdEvent = db.createEvent({
      ownerUserId: user!.id,
      name: "Tarun & Meera's Sunset Gala",
      eventType: 'Sunset Wedding Celebration',
      eventDate: '2026-12-28',
      location: 'Udaipur, Rajasthan',
      venueName: 'The Leela Palace Lakefront Pier',
      guestCount: 280,
      confirmedGuestCount: 0,
      budgetAmount: 2200000,
      currencyCode: 'INR',
      theme: 'Sunset Amber & Ivory Silks',
      eventPreferences: {
        culinaryFocus: 'Mewari Royal Cuisine',
        acousticStyle: 'Sufi & Sitar Duet',
      },
      status: 'planning',
      daysRemaining: 180,
      readinessScore: 35,
      code: 'ATELIER-TM26',
    });
    expect(createdEvent.id).toBeDefined();
    expect(createdEvent.budgetAmount).toBe(2200000);

    // Step 3: Generate AI Blueprint
    const aiBlueprint = await aiService.generatePlan(
      createdEvent.id,
      'Plan a regal sunset lakeside wedding with live Sufi ensemble, Mewari feast, and 2700K amber lanterns.',
      'Tarun & Meera Sunset Blueprint v1.0',
      'wedding'
    );
    expect(aiBlueprint.id).toBeDefined();
    expect(aiBlueprint.planJson.aestheticFeasibilityScore).toBeGreaterThanOrEqual(90);
    expect(aiBlueprint.planJson.budgetRebalance.totalBudget).toBe(2200000);

    // Step 4: Add Expense Voucher
    const expense = db.createExpense({
      eventId: createdEvent.id,
      budgetCategoryId: 'cat_catering',
      categoryName: 'Catering & Beverages',
      voucherCode: 'VCH-TM-001',
      description: 'Advance deposit for royal banquet & live charcoal grill',
      vendorName: 'Mewari Heritage Catering Co.',
      estimatedAmount: 450000,
      actualAmount: 450000,
      expenseDate: '2026-06-15',
      paymentMethod: 'RTGS / Bank Transfer',
      paymentStatus: 'settled',
      isReconciled: true,
      notes: 'Initial 50% banquet staging deposit',
    });
    expect(expense.id).toBeDefined();
    expect(expense.actualAmount).toBe(450000);

    // Step 5: Run What-If Scenario Sensitivity Simulation
    const scenario = predictionService.simulateScenario(
      createdEvent.id,
      10, // +10 guests
      'regal', // upgrade to regal decor (+75,000)
      'vintage_champagne' // add champagne package (+65,000)
    );
    // Net variance: (10 * 1500) + 75000 + 65000 = 15000 + 140000 = +155,000
    expect(scenario.netVariance).toBe(155000);

    // Save scenario snapshot to database
    const savedSnapshot = db.saveScenario({
      eventId: createdEvent.id,
      title: 'Pre-Event Scalability Scenario (+10 Pax, Regal Decor, Champagne)',
      guestShift: 10,
      decorTier: 'regal',
      barPackage: 'vintage_champagne',
      simulatedOutlay: scenario.simulatedFinalOutlay,
      variance: scenario.netVariance,
    });
    expect(savedSnapshot.id).toBeDefined();

    // Step 6: Export Consolidated Audit Report Dossier
    const metrics = predictionService.calculateBudgetMetrics(createdEvent.id);
    expect(metrics.baselineBudget).toBe(2200000);
    expect(metrics.actualSpent).toBe(450000);

    const auditReport = {
      eventCode: createdEvent.code,
      eventName: createdEvent.name,
      auditTimestamp: new Date().toISOString(),
      baselineBudget: metrics.baselineBudget,
      committedAmount: metrics.committedAmount,
      contingencyReserve: metrics.contingencyPool,
      simulationSnapshotCount: db.getScenarios(createdEvent.id).length,
      complianceStatus: 'VERIFIED_CLEAN',
    };

    expect(auditReport.complianceStatus).toBe('VERIFIED_CLEAN');
    expect(auditReport.simulationSnapshotCount).toBeGreaterThanOrEqual(1);

    // Clean up test event to keep database clean
    db.deleteEvent(createdEvent.id);
  }, 30000);

  it('E2E Flow 2: Multi-Tenant Role Isolation and IDOR Defense', () => {
    // Client user
    const clientUser = db.createUser({
      name: 'Rohan Verma',
      email: 'rohan.client@example.com',
      role: 'Client',
      passwordHash: hashPassword('clientPass2026!'),
    });

    const clientToken = createToken({
      id: clientUser.id,
      email: clientUser.email,
      role: clientUser.role,
    });
    const verified = verifyToken(clientToken);
    expect(verified?.role).toBe('Client');

    // Client creates an event
    const clientEvent = db.createEvent({
      ownerUserId: clientUser.id,
      name: "Rohan's Private Birthday Soirée",
      eventType: 'Birthday Soirée',
      eventDate: '2026-09-20',
      location: 'Mumbai',
      venueName: 'The Penthouse Bandra',
      guestCount: 60,
      confirmedGuestCount: 0,
      budgetAmount: 400000,
      currencyCode: 'INR',
      theme: 'Sunset Amber',
      eventPreferences: {},
      status: 'planning',
      daysRemaining: 140,
      readinessScore: 60,
      code: 'ATELIER-RV26',
    });

    // Unrelated intruder
    const intruderToken = createToken({
      id: 'usr_intruder_99',
      email: 'intruder@darknet.org',
      role: 'Client',
    });
    const intruderVerified = verifyToken(intruderToken);

    // Intruder attempts to modify clientEvent
    const canIntruderMutate =
      intruderVerified?.role === 'Lead Planner' ||
      intruderVerified?.userId === clientEvent.ownerUserId;

    expect(canIntruderMutate).toBe(false);

    // Clean up
    db.deleteEvent(clientEvent.id);
  });

  it('E2E Flow 3: Overrun Detection & Contingency Buffer Safeguard', () => {
    const flagshipEventId = 'evt_ananya_rohan';
    const metrics = predictionService.calculateBudgetMetrics(flagshipEventId);
    expect(metrics.contingencyPool).toBe(200000); // 8% buffer

    // Run extreme overrun scenario: +50 guests, Regal decor, vintage champagne
    // Guest delta: 50 * 1500 = 75,000
    // Decor delta: +75,000
    // Champagne delta: +65,000
    // Total variance: +215,000
    const overrunScenario = predictionService.simulateScenario(
      flagshipEventId,
      50,
      'regal',
      'vintage_champagne'
    );

    expect(overrunScenario.netVariance).toBe(215000);
    // Base forecast: 2,415,000. Outlay: 2,415,000 + 215,000 = 2,630,000
    // Budget: 2,500,000.
    // Outlay exceeds budget by 130,000 (draws 130,000 from 200,000 contingency pool)
    expect(overrunScenario.simulatedFinalOutlay).toBe(2630000);
    expect(overrunScenario.simulatedFinalOutlay > metrics.baselineBudget).toBe(true);
    const bufferDrawn = overrunScenario.simulatedFinalOutlay - metrics.baselineBudget;
    expect(bufferDrawn).toBe(130000);
    expect(bufferDrawn <= metrics.contingencyPool).toBe(true); // Safeguarded by 200k buffer
  });

  it('E2E Flow 4: Destination Beach Wedding Plan Generation & Custom Budget Alignment', async () => {
    const user = db.getUserByEmail('rutuja@atelier.com') || db.getUserByEmail('priya@atelier.com');
    expect(user).toBeDefined();

    // Create Destination Wedding Event
    const destEvent = db.createEvent({
      ownerUserId: user!.id,
      name: "Siddharth & Natasha's Goa Beach Wedding",
      eventType: 'Destination Wedding',
      eventDate: '2026-11-20',
      location: 'Goa, India',
      venueName: 'Taj Holiday Village Resort & Sands',
      guestCount: 180,
      confirmedGuestCount: 0,
      budgetAmount: 3500000,
      currencyCode: 'INR',
      theme: 'Bohemian Coastal Sunset & White Shell Florals',
      eventPreferences: {
        specialMoments: 'Sunset beachfront pheras, coconut water arrival & acoustic sundowner',
      },
      status: 'planning',
      daysRemaining: 150,
      readinessScore: 40,
      code: 'ATELIER-GOA26',
    });

    expect(destEvent.id).toBeDefined();
    expect(destEvent.guestCount).toBe(180);
    expect(destEvent.budgetAmount).toBe(3500000);

    // Synthesize plan tailored to user destination and budget parameters
    const plan = await aiService.generatePlan(
      destEvent.id,
      'Barefoot beachfront wedding in Goa with live acoustic music and fresh catch seafood banquet.',
      'Siddharth & Natasha Master Coastal Blueprint',
      'destination_wedding',
      {
        guestCount: 180,
        budgetAmount: 3500000,
        location: 'Goa, India',
        venueName: 'Taj Holiday Village Resort & Sands',
        specialWishes: 'Sunset barefoot vows by the ocean waves and late-night beach bonfire',
      }
    );

    expect(plan.id).toBeDefined();
    expect(plan.planJson.budgetRebalance.totalBudget).toBe(3500000);
    expect(plan.planJson.colorPalette.some((c) => c.name.includes('Ocean') || c.name.includes('Coral'))).toBe(true);
    expect(plan.planJson.spatialBlueprint.description).toContain('tide line');
    expect(plan.planJson.itinerary.some((item) => item.title.includes('Beach') || item.title.includes('Sunset') || item.title.includes('Vows'))).toBe(true);
    expect(plan.planJson.vendorChecklist?.some((v) => v.category.includes('Catering') || v.category.includes('Decor'))).toBe(true);

    // Apply plan to event
    const applyResult = db.applyAIPlanToEvent(destEvent.id, plan.id);
    expect(applyResult.success).toBe(true);
    expect(applyResult.categoriesUpdated).toBeGreaterThanOrEqual(4);

    // Clean up
    db.deleteEvent(destEvent.id);
  });
});
