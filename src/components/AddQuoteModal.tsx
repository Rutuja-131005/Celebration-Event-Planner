import React, { useState } from 'react';
import { vendorsService } from '../services/vendors.ts';
import { VendorQuote } from '../../server/models/types.ts';
import { Modal } from './Modal.tsx';

interface AddQuoteModalProps {
  isOpen: boolean;
  eventId: string;
  onClose: () => void;
  onQuoteAdded: (quote: VendorQuote) => void;
}

export const AddQuoteModal: React.FC<AddQuoteModalProps> = ({
  isOpen,
  eventId,
  onClose,
  onQuoteAdded,
}) => {
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('Decor & Scenography');
  const [quotedAmount, setQuotedAmount] = useState<number>(450000);
  const [validUntil, setValidUntil] = useState('2025-11-30');
  const [paymentTerms, setPaymentTerms] = useState('30% Advance / 50% Mid / 20% Wrap');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !quotedAmount) {
      setError('Vendor name and valid quoted amount are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await vendorsService.createQuote(eventId, {
        vendorName: vendorName.trim(),
        category,
        quotedAmount: Number(quotedAmount),
        validUntil,
        paymentTerms,
        notes: notes.trim() || 'Verified atelier quotation submission',
      });

      if (res.success && res.quote) {
        onQuoteAdded(res.quote);
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record quote';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="add-quote-title"
      descriptionId="add-quote-desc"
      maxWidthClass="max-w-lg"
    >
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[24px]" aria-hidden="true">
            storefront
          </span>
          <h3 id="add-quote-title" className="font-headline-sm text-headline-sm text-primary">
            Add Custom Quotation
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-outline hover:text-primary transition-colors cursor-pointer rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          type="button"
          aria-label="Close add quote dialog"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      <p id="add-quote-desc" className="sr-only">
        Enter quote submission details from partner vendors for event review.
      </p>

      {error && (
        <div
          id="quote-error-msg"
          role="alert"
          aria-live="polite"
          className="p-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="quote-vendor-name" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Vendor / Partner Name
          </label>
          <input
            id="quote-vendor-name"
            type="text"
            required
            aria-invalid={!!error}
            aria-describedby={error ? 'quote-error-msg' : undefined}
            placeholder="e.g. Royal Rajputana Events"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="quote-category" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Category
            </label>
            <select
              id="quote-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm cursor-pointer"
            >
              <option value="Decor & Scenography">Decor &amp; Scenography</option>
              <option value="Catering & Hospitality">Catering &amp; Hospitality</option>
              <option value="Cinematography & Stills">Cinematography &amp; Stills</option>
              <option value="Entertainment & Sound">Entertainment &amp; Sound</option>
              <option value="Bridal & Styling">Bridal &amp; Styling</option>
              <option value="Venues & Lodging">Venues &amp; Lodging</option>
            </select>
          </div>
          <div>
            <label htmlFor="quote-amount" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Quoted Amount (₹)
            </label>
            <input
              id="quote-amount"
              type="number"
              step="10000"
              min="1000"
              required
              value={quotedAmount}
              onChange={(e) => setQuotedAmount(Number(e.target.value))}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="quote-valid" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Validity Expiry
            </label>
            <input
              id="quote-valid"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>
          <div>
            <label htmlFor="quote-terms" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Payment Terms Schedule
            </label>
            <input
              id="quote-terms"
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="quote-notes" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Inclusions &amp; Deliverables Summary
          </label>
          <textarea
            id="quote-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. 3-tier floral mandap, sound console with backup generator"
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm resize-none"
          />
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
            className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer hover:bg-primary-container disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {submitting ? 'Recording...' : 'Add Quotation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
