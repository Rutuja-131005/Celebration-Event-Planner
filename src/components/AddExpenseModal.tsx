import React, { useState } from 'react';
import { budgetService } from '../services/budget.ts';
import { BudgetCategory, Expense } from '../../server/models/types.ts';

interface AddExpenseModalProps {
  isOpen: boolean;
  eventId: string;
  categories: BudgetCategory[];
  onClose: () => void;
  onExpenseAdded: (expense: Expense, updatedMetrics?: any) => void;
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
        description,
        vendorName: vendorName || 'Atelier Partner',
        actualAmount: Number(actualAmount),
        paymentMethod,
        paymentStatus,
        receiptRef,
      });

      if (res.success && res.expense) {
        onExpenseAdded(res.expense, res.metrics);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log expense voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant/40 space-y-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">payments</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Add Expense Voucher</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-primary transition-colors cursor-pointer" type="button">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Item & Scope Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sangeet LED Wall & Lighting Rigging Advance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Vendor / Payee
              </label>
              <input
                type="text"
                placeholder="e.g. Lotus Blossom Design"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Budget Category
              </label>
              <select
                value={budgetCategoryId}
                onChange={(e) => setBudgetCategoryId(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Invoiced Amount (₹)
              </label>
              <input
                type="number"
                step="5000"
                min="1000"
                value={actualAmount}
                onChange={(e) => setActualAmount(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e: any) => setPaymentStatus(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              >
                <option value="settled">Settled</option>
                <option value="drawdown_partial">Drawdown Partial</option>
                <option value="pending_invoice">Pending Invoice</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              >
                <option>Bank NEFT</option>
                <option>RTGS Transfer</option>
                <option>UPI Transfer</option>
                <option>Corporate Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Receipt Reference
              </label>
              <input
                type="text"
                value={receiptRef}
                onChange={(e) => setReceiptRef(e.target.value)}
                placeholder="e.g. REC-883 or PDF-402"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="pt-space-sm flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Logging...' : 'Record Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
