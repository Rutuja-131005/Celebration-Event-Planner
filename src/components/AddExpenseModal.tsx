import React, { useState } from 'react';
import { budgetService } from '../services/budget.ts';
import { BudgetCategory, Expense, BudgetMetrics } from '../../server/models/types.ts';
import { Modal } from './Modal.tsx';

interface AddExpenseModalProps {
  isOpen: boolean;
  eventId: string;
  categories: BudgetCategory[];
  onClose: () => void;
  onExpenseAdded: (expense: Expense, updatedMetrics?: BudgetMetrics) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  eventId,
  categories,
  onClose,
  onExpenseAdded,
}) => {
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [budgetCategoryId, setBudgetCategoryId] = useState(categories[0]?.id || 'cat_decor');
  const [actualAmount, setActualAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState('Bank NEFT');
  const [paymentStatus, setPaymentStatus] = useState<'settled' | 'drawdown_partial' | 'pending_invoice'>('settled');
  const [receiptRef, setReceiptRef] = useState('REC-101');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !actualAmount) {
      setError('Item description and valid amount are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const cat = categories.find((c) => c.id === budgetCategoryId);
      const res = await budgetService.createExpense(eventId, {
        budgetCategoryId,
        categoryName: cat?.categoryName || 'General',
        description: description.trim(),
        vendorName: vendorName.trim() || 'Atelier Partner',
        actualAmount: Number(actualAmount),
        paymentMethod,
        paymentStatus,
        receiptRef: receiptRef.trim(),
      });

      if (res.success && res.expense) {
        onExpenseAdded(res.expense, res.metrics);
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to log expense voucher.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="add-expense-title"
      descriptionId="add-expense-desc"
      maxWidthClass="max-w-lg"
    >
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[24px]" aria-hidden="true">
            payments
          </span>
          <h3 id="add-expense-title" className="font-headline-sm text-headline-sm text-primary">
            Add Expense Voucher
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-outline hover:text-primary transition-colors cursor-pointer rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          type="button"
          aria-label="Close add expense dialog"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      <p id="add-expense-desc" className="sr-only">
        Log an approved payment voucher or contractor disbursement against event budget.
      </p>

      {error && (
        <div
          id="expense-error-msg"
          role="alert"
          aria-live="polite"
          className="p-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="expense-desc" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Item &amp; Scope Description
          </label>
          <input
            id="expense-desc"
            type="text"
            required
            aria-invalid={!!error}
            aria-describedby={error ? 'expense-error-msg' : undefined}
            placeholder="e.g. Sangeet LED Wall & Lighting Rigging Advance"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="expense-vendor" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Vendor / Payee
            </label>
            <input
              id="expense-vendor"
              type="text"
              placeholder="e.g. Lotus Blossom Design"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>
          <div>
            <label htmlFor="expense-cat" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Budget Category
            </label>
            <select
              id="expense-cat"
              value={budgetCategoryId}
              onChange={(e) => setBudgetCategoryId(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="expense-amount" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Invoiced Amount (₹)
            </label>
            <input
              id="expense-amount"
              type="number"
              step="5000"
              min="1000"
              required
              value={actualAmount}
              onChange={(e) => setActualAmount(Number(e.target.value))}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm font-semibold"
            />
          </div>
          <div>
            <label htmlFor="expense-status" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Payment Status
            </label>
            <select
              id="expense-status"
              value={paymentStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentStatus(e.target.value as 'settled' | 'drawdown_partial' | 'pending_invoice')}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm cursor-pointer"
            >
              <option value="settled">Settled</option>
              <option value="drawdown_partial">Drawdown Partial</option>
              <option value="pending_invoice">Pending Invoice</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="expense-method" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Payment Channel
            </label>
            <select
              id="expense-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm cursor-pointer"
            >
              <option value="Bank NEFT">Bank NEFT</option>
              <option value="RTGS Transfer">RTGS Transfer</option>
              <option value="UPI Transfer">UPI Transfer</option>
              <option value="Corporate Cheque">Corporate Cheque</option>
            </select>
          </div>
          <div>
            <label htmlFor="expense-receipt" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Receipt Reference
            </label>
            <input
              id="expense-receipt"
              type="text"
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              placeholder="e.g. REC-883 or PDF-402"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="pt-space-sm flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {submitting ? 'Logging...' : 'Record Voucher'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
