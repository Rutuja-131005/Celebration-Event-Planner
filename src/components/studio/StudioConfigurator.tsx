import React from 'react';
import { AIPlanVersion } from '../../../server/models/types.ts';

interface StudioConfiguratorProps {
  eventTypeCategory: 'destination_wedding' | 'wedding' | 'birthday' | 'community' | 'custom';
  eventTitle: string;
  setEventTitle: (title: string) => void;
  guestCount: number | string;
  setGuestCount: (count: number | string) => void;
  budgetAmount: number | string;
  setBudgetAmount: (amount: number | string) => void;
  locationName: string;
  setLocationName: (loc: string) => void;
  venueName: string;
  setVenueName: (ven: string) => void;
  specialWishes: string;
  setSpecialWishes: (wishes: string) => void;
  promptText: string;
  setPromptText: (text: string) => void;
  synthesizing: boolean;
  applyingPlan: boolean;
  applySuccessMessage: string | null;
  error: string | null;
  currentPlan?: AIPlanVersion;
  onLoadPreset: (type: 'destination_wedding' | 'wedding' | 'birthday' | 'community') => void;
  onSynthesize: () => void;
  onNavigateTab?: (path: string) => void;
}

/**
 * Parameter configurator and generation trigger for GenAI Planning Studio.
 */
export const StudioConfigurator: React.FC<StudioConfiguratorProps> = ({
  eventTypeCategory,
  eventTitle,
  setEventTitle,
  guestCount,
  setGuestCount,
  budgetAmount,
  setBudgetAmount,
  locationName,
  setLocationName,
  venueName,
  setVenueName,
  specialWishes,
  setSpecialWishes,
  promptText,
  setPromptText,
  synthesizing,
  applyingPlan,
  applySuccessMessage,
  error,
  currentPlan,
  onLoadPreset,
  onSynthesize,
  onNavigateTab,
}) => {
  return (
    <section className="relative rounded-2xl bg-surface-container-lowest p-space-lg shadow-[0_10px_30px_-4px_rgba(81,44,61,0.05)] border border-outline-variant/40 space-y-space-md overflow-hidden">
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none"></div>

      {/* Accessible live region for AI generation and operations */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {synthesizing ? 'Synthesizing full AI celebration plan, please wait...' : ''}
        {applyingPlan ? 'Applying AI plan to live event...' : ''}
        {applySuccessMessage ? applySuccessMessage : ''}
        {error ? `Error: ${error}` : ''}
      </div>

      {/* Step 1: Select Event Type Domain */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[22px]" aria-hidden="true">tune</span>
          <h2 className="font-title-lg text-title-lg text-primary">1. Select Event Type &amp; One-Click Presets</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-outline font-semibold mr-1">One-Click Starter:</span>
          {(['destination_wedding', 'wedding', 'birthday', 'community'] as const).map((type) => {
            const icons = { destination_wedding: '✈️', wedding: '💍', birthday: '🎂', community: '🎪' };
            const labels = { destination_wedding: 'Destination Wedding', wedding: 'Royal Wedding', birthday: 'Birthday', community: 'Community' };
            const isSelected = eventTypeCategory === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onLoadPreset(type)}
                aria-pressed={isSelected}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span aria-hidden="true">{icons[type]}</span> {labels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Structured Parameter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <div className="md:col-span-2">
          <label htmlFor="ai-event-title-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Event Title / Occasion
          </label>
          <input
            id="ai-event-title-input"
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g. Aarav & Maya's Destination Wedding or Aria's 30th Birthday"
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm font-medium"
          />
        </div>
        <div>
          <label htmlFor="ai-guest-count-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Guest Count (Pax)
          </label>
          <input
            id="ai-guest-count-input"
            type="number"
            min="1"
            max="50000"
            placeholder="e.g. 150"
            value={guestCount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setGuestCount('');
              } else {
                const num = parseInt(val, 10);
                setGuestCount(isNaN(num) ? '' : num);
              }
            }}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm font-semibold"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="ai-budget-amount-input" className="block text-xs font-semibold uppercase tracking-wider text-outline">
              Target Budget (₹ INR)
            </label>
            <span className="text-[11px] font-bold text-secondary">
              ₹{((Number(budgetAmount) || 0) / 100000).toFixed(1)} Lakhs
            </span>
          </div>
          <input
            id="ai-budget-amount-input"
            type="number"
            step="25000"
            min="1000"
            placeholder="e.g. 1500000"
            value={budgetAmount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setBudgetAmount('');
              } else {
                const num = parseInt(val, 10);
                setBudgetAmount(isNaN(num) ? '' : num);
              }
            }}
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div>
          <label htmlFor="ai-destination-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Destination / City
          </label>
          <input
            id="ai-destination-input"
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Goa, India or Udaipur, Rajasthan"
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
          />
        </div>
        <div>
          <label htmlFor="ai-venue-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Venue Name
          </label>
          <input
            id="ai-venue-input"
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="e.g. Bayfront Beach Resort & Private Sands"
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
          />
        </div>
        <div>
          <label htmlFor="ai-special-wishes-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
            Atmosphere &amp; Special Wishes
          </label>
          <input
            id="ai-special-wishes-input"
            type="text"
            value={specialWishes}
            onChange={(e) => setSpecialWishes(e.target.value)}
            placeholder="e.g. Barefoot ocean vows, acoustic sundowner, seafood grill..."
            className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Step 3: Curatorial Brief Textarea */}
      <div className="relative rounded-xl bg-surface-container-low/70 p-space-md focus-within:bg-surface-container-lowest focus-within:shadow-[0_4px_16px_rgba(81,44,61,0.08)] transition-all border border-outline-variant/30">
        <label htmlFor="ai-curatorial-brief" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
          Curatorial Brief &amp; Detailed Prompt
        </label>
        <textarea
          id="ai-curatorial-brief"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={2}
          placeholder="Describe your creative vision, catering wishes, acoustic tone, and specific constraints..."
          className="w-full bg-transparent resize-none outline-none font-headline-sm text-headline-sm text-primary placeholder:text-outline/60 leading-relaxed text-sm md:text-base"
        />
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
        <div className="flex items-center gap-space-sm text-outline font-body-sm text-body-sm">
          <span className="flex items-center gap-1 text-tertiary font-medium">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Ready for AI Synthesis
          </span>
          {currentPlan?.isDevelopmentFallback && (
            <span className="px-2 py-0.5 rounded text-[11px] bg-secondary-fixed text-on-secondary-fixed font-semibold">
              Intelligent Synthesis
            </span>
          )}
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => setPromptText('')}
            className="px-space-md py-space-sm rounded-xl font-title-md text-title-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer text-sm"
            type="button"
          >
            Clear
          </button>
          <button
            onClick={onSynthesize}
            disabled={synthesizing}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md py-space-sm px-space-lg rounded-xl shadow-[0_4px_16px_rgba(56,23,39,0.25)] hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75 text-sm"
            type="button"
          >
            <span className={`material-symbols-outlined text-[20px] text-secondary-fixed ${synthesizing ? 'animate-spin' : ''}`}>
              {synthesizing ? 'refresh' : 'auto_awesome'}
            </span>
            <span>{synthesizing ? 'Generating Complete AI Plan...' : 'Generate GenAI Plan'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {applySuccessMessage && (
        <div className="p-4 rounded-xl bg-tertiary-container/40 border border-tertiary/40 text-on-surface text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">check_circle</span>
            <span>{applySuccessMessage}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onNavigateTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('budget-and-forecast')}
                  className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold cursor-pointer"
                >
                  View Budget
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('timeline-and-tasks')}
                  className="px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold cursor-pointer"
                >
                  View Timeline
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
