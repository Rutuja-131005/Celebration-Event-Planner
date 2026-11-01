import React, { useState, useMemo } from 'react';
import { Event, Vendor, VendorQuote } from '../../server/models/types.ts';
import { Modal } from '../components/Modal.tsx';

interface VendorsQuotationsProps {
  event: Event;
  vendors: Vendor[];
  quotes: VendorQuote[];
  onOpenAddQuote: () => void;
  onRefreshData: () => void;
}

export const VendorsQuotations: React.FC<VendorsQuotationsProps> = ({
  event,
  vendors,
  quotes,
  onOpenAddQuote,
  onRefreshData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendationAccepted, setRecommendationAccepted] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);

  // Format currency in INR format
  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  // Derive dynamic category counts from real quotes
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    quotes.forEach((q) => {
      const cat = q.category || 'General';
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const list = [{ label: `All Quotes (${quotes.length})`, value: 'All', count: quotes.length }];
    map.forEach((count, cat) => {
      list.push({ label: `${cat} (${count})`, value: cat, count });
    });
    return list;
  }, [quotes]);

  // Dynamic search and category filtering
  const filteredQuotes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return quotes.filter((quote) => {
      const matchesCategory =
        selectedCategory === 'All' || quote.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !q ||
        quote.vendorName.toLowerCase().includes(q) ||
        quote.category.toLowerCase().includes(q) ||
        quote.contractScope?.some((s) => s.toLowerCase().includes(q)) ||
        quote.inclusions?.some((i) => i.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [quotes, selectedCategory, searchQuery]);

  // Co-Pilot Recommendation quote (if any)
  const recommendedQuote = useMemo(() => {
    return quotes.find((q) => q.isAiRecommended) || quotes[0] || null;
  }, [quotes]);

  // Quotes to compare in the head-to-head matrix
  const compareQuotes = useMemo(() => {
    if (selectedQuoteIds.length > 0) {
      return quotes.filter((q) => selectedQuoteIds.includes(q.id)).slice(0, 2);
    }
    return quotes.slice(0, 2);
  }, [quotes, selectedQuoteIds]);

  const handleToggleCompare = (quoteId: string) => {
    setSelectedQuoteIds((prev) => {
      if (prev.includes(quoteId)) {
        return prev.filter((id) => id !== quoteId);
      }
      if (prev.length >= 2) {
        return [prev[1], quoteId];
      }
      return [...prev, quoteId];
    });
    setShowCompareModal(true);
  };

  const totalCommitted = useMemo(() => {
    return quotes
      .filter((q) => q.bookingStatus === 'approved' || q.bookingStatus === 'contract_signed')
      .reduce((sum, q) => sum + q.quotedAmount, 0);
  }, [quotes]);

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* PAGE HEADER & ACTION DOCK */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-sm border-b border-outline-variant/30">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Curated Partner Network
              </span>
              <span className="font-label-sm text-label-sm text-outline">
                {event.name} Dossier
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Vendors &amp; Quotations
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Curate verified luxury hospitality partners, evaluate line-item deliverables, and track booking commitments for {event.name}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-space-sm">
            {quotes.length >= 2 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-sm transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">balance</span>
                <span>Compare Matrix</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-sm border border-outline-variant/30 transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
              <span>Export Dossier</span>
            </button>

            <button
              onClick={onOpenAddQuote}
              className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-md transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add Quotation</span>
            </button>
          </div>
        </section>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search quotes by vendor name, category, or scope (e.g. florals, sound, catering)...`}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary text-sm shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-outline hover:text-on-surface cursor-pointer text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* CO-PILOT RECOMMENDATION BANNER */}
        {recommendedQuote && (
          <section className="p-space-md rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex flex-col sm:flex-row sm:items-center gap-space-md shadow-sm border border-tertiary/20">
            <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-label-sm uppercase tracking-wider font-bold text-tertiary">
                  Co-Pilot Recommended Partner
                </span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-xs font-semibold">
                  {recommendedQuote.category}
                </span>
              </div>
              <p className="font-title-md text-primary font-bold mt-0.5">
                {recommendedQuote.vendorName} · {formatINR(recommendedQuote.quotedAmount)}
              </p>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                {recommendedQuote.notes ||
                  `Calibrated deliverable package for ${event.name} with verified reliability and balanced budget allocation.`}
              </p>
            </div>
            <button
              onClick={() => setRecommendationAccepted(!recommendationAccepted)}
              className="sm:self-center bg-primary text-on-primary hover:bg-primary-container px-space-md py-2 rounded-xl font-label-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              type="button"
            >
              {recommendationAccepted ? 'Recommendation Accepted ✓' : 'Accept Recommendation'}
            </button>
          </section>
        )}

        {/* QUOTES & VENDORS CARDS GRID */}
        <section className="space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-primary">Active Quotations &amp; Contracts</h2>
              <span className="font-label-md text-label-md text-outline">
                Showing {filteredQuotes.length} of {quotes.length} total
              </span>
            </div>
          </div>

          {filteredQuotes.length === 0 ? (
            <div className="p-space-xl rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-center space-y-space-sm shadow-xs">
              <div className="w-12 h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <h3 className="font-title-lg text-primary font-bold">No Quotations Found</h3>
              <p className="font-body-md text-on-surface-variant max-w-md mx-auto text-sm">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No vendor quotations match your current search and category filters. Try clearing filters to see all partner quotes.'
                  : `No quotations have been added for ${event.name} yet. Log your first vendor proposal or generate recommendations.`}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={onOpenAddQuote}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-sm font-semibold cursor-pointer shadow-sm"
                >
                  Add Quotation
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              {filteredQuotes.map((quote) => {
                const isApproved = quote.bookingStatus === 'approved';
                const isSigned = quote.bookingStatus === 'contract_signed';
                const isUnderReview = quote.bookingStatus === 'under_review';

                return (
                  <article
                    key={quote.id}
                    className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 hover:border-outline-variant/60 hover:shadow-md transition-all flex flex-col justify-between space-y-space-md"
                  >
                    <div className="space-y-space-sm">
                      <div className="flex items-start justify-between gap-space-sm">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-xs font-semibold text-secondary">
                              {quote.category}
                            </span>
                            {quote.isAiRecommended && (
                              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                                Top Pick
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline-sm text-primary font-bold">{quote.vendorName}</h3>
                          <p className="text-xs text-outline mt-0.5">
                            Quoted: {quote.quoteDate} · Valid until: {quote.validUntil}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="font-headline-md text-primary font-bold block">
                            {formatINR(quote.quotedAmount)}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mt-1 ${
                              isApproved || isSigned
                                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                : isUnderReview
                                ? 'bg-secondary-fixed text-on-secondary-fixed'
                                : 'bg-surface-container text-outline'
                            }`}
                          >
                            {quote.bookingStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Contract Scope & Inclusions */}
                      {quote.contractScope && quote.contractScope.length > 0 && (
                        <div className="bg-surface-container-low/70 p-3 rounded-xl border border-outline-variant/20 space-y-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-1">
                            Contract Scope &amp; Inclusions
                          </span>
                          {quote.contractScope.slice(0, 3).map((scope, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-on-surface">
                              <span className="material-symbols-outlined text-[15px] text-tertiary shrink-0">
                                check_circle
                              </span>
                              <span className="truncate">{scope}</span>
                            </div>
                          ))}
                          {quote.contractScope.length > 3 && (
                            <span className="text-[11px] text-secondary font-semibold block pt-0.5">
                              +{quote.contractScope.length - 3} more deliverables
                            </span>
                          )}
                        </div>
                      )}

                      {/* Payment Terms & Notes */}
                      <div className="flex items-center justify-between text-xs text-outline pt-1">
                        <span>Terms: <strong className="text-on-surface">{quote.paymentTerms || 'Standard Milestones'}</strong></span>
                        <span className="text-tertiary font-medium flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px]">shield</span> Escrow Secured
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between gap-space-sm">
                      <button
                        onClick={() => handleToggleCompare(quote.id)}
                        className="text-xs font-semibold text-secondary hover:underline cursor-pointer flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">balance</span>
                        <span>Compare Spec</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={onRefreshData}
                          className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold cursor-pointer transition-colors"
                          type="button"
                        >
                          Review Scope
                        </button>
                        <button
                          onClick={onRefreshData}
                          className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                          type="button"
                        >
                          {isApproved ? 'Approved ✓' : 'Approve Quote'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FINANCIAL SUMMARY & ESCROW STATUS */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-tertiary font-label-md text-label-md uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Atelier Escrow Protection</span>
            </div>
            <h3 className="font-headline-sm text-primary font-bold">
              Vendor Governance &amp; Protected Disbursements
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant max-w-xl">
              All contract commitments are governed under standard luxury hospitality Service Level Agreements with staged milestone releases and delivery guarantees.
            </p>
          </div>

          <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-3 rounded-xl border border-outline-variant/20 shrink-0">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block">Total Committed</span>
              <span className="text-xl font-bold text-primary">{formatINR(totalCommitted)}</span>
            </div>
            <div className="h-8 w-px bg-outline-variant/40"></div>
            <div className="text-left">
              <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block">Contract Count</span>
              <span className="text-xl font-bold text-secondary">{quotes.length} Quotes</span>
            </div>
          </div>
        </section>

        {/* HEAD-TO-HEAD COMPARISON MODAL */}
        <Modal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          titleId="compare-matrix-title"
          maxWidthClass="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">balance</span>
                <h3 id="compare-matrix-title" className="font-headline-sm text-headline-sm text-primary font-bold">
                  Head-to-Head Quotation Comparison
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-outline hover:text-primary transition-colors cursor-pointer p-1"
                aria-label="Close Comparison Matrix"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {compareQuotes.length >= 2 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {compareQuotes.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      idx === 0
                        ? 'bg-surface-container-low border-primary/30'
                        : 'bg-surface-container-lowest border-outline-variant/40'
                    }`}
                  >
                    <div>
                      <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block mb-0.5">
                        {q.category}
                      </span>
                      <h4 className="font-title-lg font-bold text-primary">{q.vendorName}</h4>
                      <p className="text-xl font-bold text-secondary mt-1">{formatINR(q.quotedAmount)}</p>
                      <span className="text-xs text-outline">{q.paymentTerms || 'Standard Terms'}</span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
                      <span className="text-xs font-bold text-outline uppercase tracking-wider block">
                        Included Deliverables
                      </span>
                      <ul className="space-y-1 text-xs text-on-surface">
                        {(q.contractScope || ['Standard services']).map((item, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-tertiary shrink-0">check</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {q.exclusions && q.exclusions.length > 0 && (
                      <div className="space-y-1 pt-1 text-xs text-outline">
                        <span className="font-bold text-[11px] uppercase tracking-wider block text-outline">
                          Exclusions
                        </span>
                        {q.exclusions.map((ex, i) => (
                          <p key={i}>• {ex}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-6">
                Please add at least 2 vendor quotations to view a side-by-side comparison matrix.
              </p>
            )}

            <div className="flex justify-end pt-3 border-t border-outline-variant/30">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-sm cursor-pointer shadow-xs"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
