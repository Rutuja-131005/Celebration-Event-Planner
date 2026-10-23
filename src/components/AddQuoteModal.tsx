import React, { useState } from 'react';
import { vendorsService } from '../services/vendors.ts';
import { VendorQuote } from '../../server/models/types.ts';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || !quotedAmount) return;

    try {
      setSubmitting(true);
      const res = await vendorsService.createQuote(eventId, {
        vendorName,
        category,
        quotedAmount: Number(quotedAmount),
        validUntil,
        paymentTerms,
        notes: notes || 'Verified atelier quotation submission',
      });

      if (res.success && res.quote) {
        onQuoteAdded(res.quote);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant/40 space-y-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">storefront</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Add Custom Quotation</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-primary transition-colors cursor-pointer" type="button">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Vendor / Partner Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Rajputana Events"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              >
                <option>Decor & Scenography</option>
                <option>Catering & Hospitality</option>
                <option>Cinematography & Stills</option>
                <option>Entertainment & Sound</option>
                <option>Bridal & Styling</option>
                <option>Venues & Lodging</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Quoted Total (₹)
              </label>
              <input
                type="number"
                step="10000"
                min="5000"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Scope & Inclusions Summary
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 20ft hand-carved mandap, brass diyas, and 24h floral artisan crew"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm resize-none"
            />
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
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
