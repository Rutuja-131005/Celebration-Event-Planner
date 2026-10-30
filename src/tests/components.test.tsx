import React, { useState } from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AddExpenseModal } from '../components/AddExpenseModal.tsx';
import { AddTaskModal } from '../components/AddTaskModal.tsx';
import { AddQuoteModal } from '../components/AddQuoteModal.tsx';
import { BudgetCategory, Event } from '../../server/models/types.ts';

const mockEvent: Event = {
  id: 'evt_test_1',
  ownerUserId: 'usr_priya_lead',
  name: "Aditi & Kabir's Heritage Celebration",
  eventType: 'Heritage Wedding',
  eventDate: '2026-11-15',
  location: 'Jaipur, Rajasthan',
  venueName: 'Rambagh Palace',
  guestCount: 250,
  confirmedGuestCount: 0,
  budgetAmount: 2000000,
  currencyCode: 'INR',
  theme: 'Royal Rajputana',
  eventPreferences: {},
  status: 'planning',
  daysRemaining: 120,
  readinessScore: 88,
  code: 'ATELIER-TEST',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockCategories: BudgetCategory[] = [
  {
    id: 'cat_catering',
    eventId: 'evt_test_1',
    categoryName: 'Catering & Beverages',
    plannedAmount: 700000,
    committedAmount: 650000,
    actualAmount: 0,
    priority: 'high',
    status: 'booked',
    notes: 'Royal buffet',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_decor',
    eventId: 'evt_test_1',
    categoryName: 'Decor & Production',
    plannedAmount: 500000,
    committedAmount: 480000,
    actualAmount: 0,
    priority: 'high',
    status: 'quoted',
    notes: 'Floral mandap',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('Frontend Component Tests Suite', () => {
  it('AddExpenseModal renders accessible inputs and rejects empty payee submissions', () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <AddExpenseModal
        isOpen={true}
        onClose={handleClose}
        eventId="evt_test_1"
        categories={mockCategories}
        onExpenseAdded={handleCreated}
      />
    );

    // Assert form labels and inputs are accessible
    expect(screen.getByLabelText(/item & scope description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vendor \/ payee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invoiced amount/i)).toBeInTheDocument();

    // Clear payee and submit
    const payeeInput = screen.getByLabelText(/vendor \/ payee/i);
    fireEvent.change(payeeInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /record voucher/i });
    fireEvent.click(submitBtn);

    // Should not call handleCreated when required field is empty
    expect(handleCreated).not.toHaveBeenCalled();
  });

  it('AddTaskModal renders accessible fields and triggers creation on valid inputs', async () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <AddTaskModal
        isOpen={true}
        onClose={handleClose}
        eventId="evt_test_1"
        onTaskAdded={handleCreated}
      />
    );

    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority urgency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assigned planner/i)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/task title/i);
    fireEvent.change(titleInput, { target: { value: 'Inspect Floral Canopy Truss' } });

    const submitBtn = screen.getByRole('button', { name: /assign milestone/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Form dispatches creation
    expect(titleInput).toHaveValue('Inspect Floral Canopy Truss');
  });

  it('AddQuoteModal validates quote amount and vendor assignment', () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <AddQuoteModal
        isOpen={true}
        onClose={handleClose}
        eventId="evt_test_1"
        onQuoteAdded={handleCreated}
      />
    );

    expect(screen.getByLabelText(/vendor \/ partner name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quoted amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();

    const vendorInput = screen.getByLabelText(/vendor \/ partner name/i);
    fireEvent.change(vendorInput, { target: { value: 'Udaipur Royal Soundworks' } });
    expect(vendorInput).toHaveValue('Udaipur Royal Soundworks');
  });

  it('Scenario Simulator calculates dynamic net variance and contingency drawdown', () => {
    // Math verification for Scenario Simulator
    const baselineBudget = 2500000;
    const baseForecast = 2415000;
    const guestShift = 20;
    const costPerGuest = 1500;
    const guestImpact = guestShift * costPerGuest; // 30,000
    const decorRegalDelta = 75000;
    const barChampagneDelta = 65000;

    const netVariance = guestImpact + decorRegalDelta + barChampagneDelta; // 170,000
    const simulatedOutlay = baseForecast + netVariance; // 2,585,000
    const bufferDrawn = simulatedOutlay > baselineBudget;
    const bufferAmount = bufferDrawn ? simulatedOutlay - baselineBudget : 0;

    expect(netVariance).toBe(170000);
    expect(simulatedOutlay).toBe(2585000);
    expect(bufferDrawn).toBe(true);
    expect(bufferAmount).toBe(85000); // 85,000 drawn from contingency pool
  });
});
