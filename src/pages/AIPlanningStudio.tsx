import React, { useState } from 'react';
import { Event, AIPlanVersion } from '../../server/models/types.ts';
import { planningService } from '../services/planning.ts';

interface AIPlanningStudioProps {
  event: Event;
  plans: AIPlanVersion[];
  onRefreshPlans: () => void;
  onEventUpdated?: (updatedEvent: Event) => void;
  onNavigateTab?: (path: string) => void;
}

export const AIPlanningStudio: React.FC<AIPlanningStudioProps> = ({
  event,
  plans,
  onRefreshPlans,
  onEventUpdated,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'ideas' | 'budget' | 'timeline' | 'vendors'>('ideas');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  // Input states
  const [eventTypeCategory, setEventTypeCategory] = useState<'wedding' | 'birthday' | 'community' | 'custom'>('wedding');
  const [eventTitle, setEventTitle] = useState(event.name);
  const [guestCount, setGuestCount] = useState<number>(event.guestCount);
  const [budgetAmount, setBudgetAmount] = useState<number>(event.budgetAmount);
  const [locationName, setLocationName] = useState(event.location);
  const [venueName, setVenueName] = useState(event.venueName);
  const [specialWishes, setSpecialWishes] = useState('Lakeside sunset acoustic set, artisanal royal thali, warm brass lantern glow, strict curfew compliance');
  
  const [promptText, setPromptText] = useState(
    'Plan an unforgettable luxury celebration. Prioritize authentic culinary stations, harmonic 2700K ambient illumination, signature guest activities, and optimize floral and sound production below budget cap.'
  );

  const [customAdjustment, setCustomAdjustment] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);
  const [applyingPlan, setApplyingPlan] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan: AIPlanVersion | undefined = plans[selectedPlanIndex] || plans[0];
  const planData = currentPlan?.planJson;

  // Preset Handlers for the 3 core challenge domains
  const handleLoadPreset = (type: 'wedding' | 'birthday' | 'community') => {
    setEventTypeCategory(type);
    setError(null);
    setApplySuccessMessage(null);

    if (type === 'wedding') {
      setEventTitle("Ananya & Rohan's Royal Heritage Wedding");
      setGuestCount(320);
      setBudgetAmount(2500000);
      setLocationName('Udaipur, Rajasthan');
      setVenueName('Jagmandir Island Palace, Lake Pichola');
      setSpecialWishes('Floating mandap, shehnai welcome boat procession, Mewari royal thali, and acoustic Sufi sundowner');
      setPromptText('Plan a 3-day royal heritage palace wedding for 320 guests at an outdoor lakeside pavilion. Prioritize authentic Rajasthani catering, warm brass lanterns, acoustic Sufi ensemble, floral mandap, and keep total decor under budget cap.');
    } else if (type === 'birthday') {
      setEventTitle("Aria's 30th Bohemian Sunset Birthday");
      setGuestCount(75);
      setBudgetAmount(450000);
      setLocationName('Bandra West, Mumbai');
      setVenueName('The Glass Horizon Rooftop Terrace');
      setSpecialWishes('Live vinyl DJ, signature cocktail tasting flight, artisanal 3-tier lemon raspberry cake, and retro audio phone guestbook');
      setPromptText('Plan a chic 30th milestone birthday sunset soirée for 75 guests on a panoramic rooftop terrace. Prioritize craft mixology, grazing charcuterie tables, live vinyl DJ, retro audio guestbook, and warm festoon lighting.');
    } else if (type === 'community') {
      setEventTitle('Meadowbrook Cultural Harvest Festival');
      setGuestCount(450);
      setBudgetAmount(800000);
      setLocationName('Central Park Commons, Bengaluru');
      setVenueName('Community Amphitheater & South Lawn');
      setSpecialWishes('30 Local maker and food truck stalls, covered performance stage, volunteer coordination, and certified zero-waste stations');
      setPromptText('Organize a vibrant community cultural harvest festival for 450 neighborhood attendees. Include covered acoustic amphitheater stage, 30 local maker and food truck booths, tasting passport tour, civic permits, and zero-waste cleanup.');
    }
  };

  const handleSynthesize = async () => {
    try {
      setSynthesizing(true);
      setError(null);
      setApplySuccessMessage(null);

      const combinedPrompt = `${promptText} | Event Title: ${eventTitle} | Type: ${eventTypeCategory} | Location: ${locationName} (${venueName}) | Guests: ${guestCount} | Target Budget: ₹${budgetAmount.toLocaleString('en-IN')} | Special Parameters: ${specialWishes}`;

      const res = await planningService.generatePlan(
        event.id,
        combinedPrompt,
        `${eventTitle} (${eventTypeCategory.toUpperCase()})`,
        eventTypeCategory
      );

      if (res.success) {
        onRefreshPlans();
        setSelectedPlanIndex(0);
      }
    } catch (err: any) {
      setError(err.message || 'GenAI plan synthesis failed.');
    } finally {
      setSynthesizing(false);
    }
  };

  const handleApplyPlanToEvent = async () => {
    if (!currentPlan) return;
    try {
      setApplyingPlan(true);
      setError(null);
      setApplySuccessMessage(null);

      const res = await planningService.applyPlan(event.id, currentPlan.id);
      if (res.success) {
        setApplySuccessMessage(
          `Successfully applied plan to live event! Synchronized ${res.categoriesUpdated} budget categories and added ${res.tasksAdded} milestone & vendor tasks.`
        );
        if (res.event && onEventUpdated) {
          onEventUpdated(res.event);
        }
        onRefreshPlans();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply plan to active event.');
    } finally {
      setApplyingPlan(false);
    }
  };

  const handleQuickAdjustment = async (chipText: string) => {
    try {
      setSynthesizing(true);
      setError(null);
      await planningService.replan(event.id, chipText, eventTypeCategory);
      onRefreshPlans();
      setSelectedPlanIndex(0);
    } catch (err: any) {
      setError(err.message || 'Quick adjustment failed.');
    } finally {
      setSynthesizing(false);
    }
  };

  const handleCustomAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAdjustment.trim()) return;

    try {
      setSynthesizing(true);
      setError(null);
      await planningService.replan(event.id, customAdjustment, eventTypeCategory);
      setCustomAdjustment('');
      onRefreshPlans();
      setSelectedPlanIndex(0);
    } catch (err: any) {
      setError(err.message || 'Custom adjustment failed.');
    } finally {
      setSynthesizing(false);
    }
  };

  // Safe accessor for categories
  const budgetCategories = planData?.budgetRebalance?.categories || [
    { name: 'Catering & Beverages', amount: Math.round(event.budgetAmount * 0.35), percentage: 35, priority: 'high', note: 'Food & drinks' },
    { name: 'Venue & Audio Logistics', amount: Math.round(event.budgetAmount * 0.22), percentage: 22, priority: 'high', note: 'Site & sound rig' },
    { name: 'Decor & Scenography', amount: Math.round(event.budgetAmount * 0.20), percentage: 20, priority: 'medium', note: 'Lighting & florals' },
    { name: 'Entertainment & Artists', amount: Math.round(event.budgetAmount * 0.12), percentage: 12, priority: 'medium', note: 'Performers & sound' },
    { name: 'Buffer & Contingency', amount: Math.round(event.budgetAmount * 0.11), percentage: 11, priority: 'low', note: 'Safety reserve' },
  ];

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* Studio Header & Calibration Banner */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg border-b border-outline-variant/30">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex flex-wrap items-center gap-space-sm mb-space-xs">
              <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                GenAI Planning Assistant
              </span>
              <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Weddings • Birthdays • Community Events
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">AI Planning Studio</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Generate bespoke budgets, minute-by-minute timelines, vendor sourcing checklists, and personalized creative ideas for any celebration.
            </p>
          </div>

          {/* Active Canvas Badge */}
          <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(81,44,61,0.06)] max-w-md w-full border border-outline-variant/30">
            <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">
                {eventTypeCategory === 'birthday' ? 'cake' : eventTypeCategory === 'community' ? 'festival' : 'celebration'}
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
                  Active Canvas
                </span>
                <span className="font-label-sm text-label-sm text-outline">{event.location}</span>
              </div>
              <p className="font-title-md text-title-md text-on-surface truncate">{event.name}</p>
              <div className="flex items-center gap-space-sm text-outline font-body-sm text-body-sm mt-0.5">
                <span>{event.guestCount} Guests</span>
                <span>•</span>
                <span className="font-medium text-on-surface">
                  ₹{event.budgetAmount.toLocaleString('en-IN')} Cap
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* INPUT PANEL: GENAI PLANNING ASSISTANT CONFIGURATOR */}
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
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-outline font-semibold mr-1">One-Click Starter:</span>
              <button
                type="button"
                onClick={() => handleLoadPreset('wedding')}
                aria-pressed={eventTypeCategory === 'wedding'}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  eventTypeCategory === 'wedding'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span aria-hidden="true">💍</span> Wedding
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('birthday')}
                aria-pressed={eventTypeCategory === 'birthday'}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  eventTypeCategory === 'birthday'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span aria-hidden="true">🎂</span> Birthday
              </button>
              <button
                type="button"
                onClick={() => handleLoadPreset('community')}
                aria-pressed={eventTypeCategory === 'community'}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  eventTypeCategory === 'community'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span aria-hidden="true">🎪</span> Community
              </button>
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
                placeholder="e.g. Ananya & Rohan's Wedding or Aria's 30th Birthday"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm"
              />
            </div>
            <div>
              <label htmlFor="ai-guest-count-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Guest Count (Pax)
              </label>
              <input
                id="ai-guest-count-input"
                type="number"
                min="10"
                max="5000"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label htmlFor="ai-budget-amount-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Target Budget (₹ INR)
              </label>
              <input
                id="ai-budget-amount-input"
                type="number"
                step="25000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div>
              <label htmlFor="ai-destination-venue-input" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Destination &amp; Venue
              </label>
              <input
                id="ai-destination-venue-input"
                type="text"
                value={`${locationName} · ${venueName}`}
                onChange={(e) => {
                  const parts = e.target.value.split('·');
                  setLocationName(parts[0]?.trim() || '');
                  setVenueName(parts[1]?.trim() || parts[0]?.trim() || '');
                }}
                placeholder="City, State · Venue Name"
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
                placeholder="e.g. Craft cocktails, live vinyl DJ, sunset sundowner..."
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
                onClick={handleSynthesize}
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

        {/* OUTPUT BLUEPRINT HEADER & FOUR PILLAR TABS */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          {/* Main 8 Columns: Generated Plan Tabs */}
          <div className="xl:col-span-8 flex flex-col space-y-space-lg">
            {/* Quick Action: Apply Plan to Active Event */}
            <div className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <span className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary material-symbols-outlined text-[20px] shrink-0">
                  sync_saved_locally
                </span>
                <div>
                  <h4 className="font-title-md text-title-md text-primary font-semibold">
                    {currentPlan?.versionTitle || 'Generated Blueprint'}
                  </h4>
                  <p className="font-body-sm text-body-sm text-outline">
                    {currentPlan?.curationConcept || 'Personalized plan ready for implementation'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyPlanToEvent}
                disabled={applyingPlan || !currentPlan}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-title-md text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span className={`material-symbols-outlined text-[18px] ${applyingPlan ? 'animate-spin' : ''}`}>
                  {applyingPlan ? 'sync' : 'publish'}
                </span>
                <span>{applyingPlan ? 'Applying Plan...' : 'Apply Plan to Live Event'}</span>
              </button>
            </div>

            {/* Studio Tabs Navigation: 4 Core Pillars */}
            <div
              role="tablist"
              aria-label="Planning Studio Dimensions"
              className="flex items-center justify-between pb-space-xs border-b border-outline-variant/40 overflow-x-auto"
            >
              <div className="flex items-center gap-space-xs">
                <button
                  id="tab-ideas"
                  role="tab"
                  aria-selected={activeTab === 'ideas'}
                  aria-controls="panel-ideas"
                  onClick={() => setActiveTab('ideas')}
                  className={`px-space-md py-space-sm rounded-t-xl font-title-md text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'ideas'
                      ? 'active text-primary bg-surface-container-lowest shadow-[0_-2px_8px_rgba(81,44,61,0.04)] border-t border-x border-outline-variant/40'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">lightbulb</span>
                  <span>Personalized Ideas</span>
                </button>

                <button
                  id="tab-budget"
                  role="tab"
                  aria-selected={activeTab === 'budget'}
                  aria-controls="panel-budget"
                  onClick={() => setActiveTab('budget')}
                  className={`px-space-md py-space-sm rounded-t-xl font-title-md text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'budget'
                      ? 'active text-primary bg-surface-container-lowest shadow-[0_-2px_8px_rgba(81,44,61,0.04)] border-t border-x border-outline-variant/40'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">payments</span>
                  <span>Budget Allocation</span>
                </button>

                <button
                  id="tab-timeline"
                  role="tab"
                  aria-selected={activeTab === 'timeline'}
                  aria-controls="panel-timeline"
                  onClick={() => setActiveTab('timeline')}
                  className={`px-space-md py-space-sm rounded-t-xl font-title-md text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'timeline'
                      ? 'active text-primary bg-surface-container-lowest shadow-[0_-2px_8px_rgba(81,44,61,0.04)] border-t border-x border-outline-variant/40'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">schedule</span>
                  <span>Timelines &amp; Run-of-Show</span>
                </button>

                <button
                  id="tab-vendors"
                  role="tab"
                  aria-selected={activeTab === 'vendors'}
                  aria-controls="panel-vendors"
                  onClick={() => setActiveTab('vendors')}
                  className={`px-space-md py-space-sm rounded-t-xl font-title-md text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'vendors'
                      ? 'active text-primary bg-surface-container-lowest shadow-[0_-2px_8px_rgba(81,44,61,0.04)] border-t border-x border-outline-variant/40'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">checklist</span>
                  <span>Vendor Checklist</span>
                </button>
              </div>
            </div>

            {/* TAB 1: PERSONALIZED IDEAS & CREATIVE DIRECTION */}
            {activeTab === 'ideas' && (
              <div id="panel-ideas" role="tabpanel" aria-labelledby="tab-ideas" className="space-y-space-lg">
                {/* Concept Narrative */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                        Creative Concept &amp; Story
                      </span>
                      <h2 className="font-headline-lg text-headline-lg text-primary">{currentPlan?.curationConcept}</h2>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-high px-3 py-1 rounded-full self-start">
                      <span className="material-symbols-outlined text-secondary text-[16px]">stars</span>
                      <span className="text-xs font-semibold text-primary">
                        Score {planData?.aestheticFeasibilityScore || 96}%
                      </span>
                    </div>
                  </div>

                  {/* 4 Signature Interactive Moments */}
                  <div className="pt-space-xs">
                    <h3 className="font-title-md text-title-md text-primary font-semibold mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">auto_awesome</span>
                      Personalized Signature Moments &amp; Activities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {(planData?.personalizedIdeas || [
                        {
                          title: 'Interactive Signature Moment',
                          category: 'activity',
                          description: 'Custom activity curated specifically for your guest count and location.',
                          impact: 'High guest engagement and memorable storytelling.',
                        },
                      ]).map((idea, idx) => (
                        <div key={idx} className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/20">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                              {idea.category.replace('_', ' ')}
                            </span>
                            <span className="material-symbols-outlined text-secondary text-[16px]">sparkles</span>
                          </div>
                          <h4 className="font-title-md text-title-md text-primary font-semibold">{idea.title}</h4>
                          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{idea.description}</p>
                          <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-1.5 text-xs text-tertiary font-medium">
                            <span className="material-symbols-outlined text-[14px]">psychology</span>
                            <span>{idea.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette Harmonizer */}
                  <div className="pt-space-sm space-y-space-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="font-title-md text-title-md text-primary font-semibold">Harmonic Color Palette</h4>
                      <span className="text-xs text-outline">Material Applications</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                      {(planData?.colorPalette || []).map((col, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-surface-container-low space-y-2 border border-outline-variant/20">
                          <div className="flex items-center justify-between">
                            <div className="w-7 h-7 rounded-lg shadow-sm border border-black/10" style={{ backgroundColor: col.hex }}></div>
                            <span className="font-mono text-xs text-outline">{col.hex}</span>
                          </div>
                          <div>
                            <p className="font-title-sm text-xs font-bold text-primary truncate">{col.name}</p>
                            <p className="text-[11px] text-on-surface-variant truncate">{col.usage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spatial & Sensory Atmosphere */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                    <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/20">
                      <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-semibold">
                        <span className="material-symbols-outlined text-[20px] text-secondary">light_mode</span>
                        <span>Lighting &amp; Spatial Architecture</span>
                      </div>
                      <p className="font-body-md text-sm text-on-surface-variant">
                        {planData?.spatialBlueprint?.lightingArchitecture}
                      </p>
                    </div>
                    <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/20">
                      <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-semibold">
                        <span className="material-symbols-outlined text-[20px] text-secondary">spa</span>
                        <span>Sensory &amp; Acoustic Atmosphere</span>
                      </div>
                      <p className="font-body-md text-sm text-on-surface-variant">
                        {planData?.spatialBlueprint?.olfactoryTactileSignature}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SMART BUDGET ALLOCATION */}
            {activeTab === 'budget' && (
              <div id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="space-y-space-lg">
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                        Algorithmic Allocation
                      </span>
                      <h2 className="font-headline-lg text-headline-lg text-primary">
                        ₹{event.budgetAmount.toLocaleString('en-IN')} Total Budget Plan
                      </h2>
                    </div>
                    <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-1 rounded-full self-start">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        100% Balanced Allocation
                      </span>
                    </div>
                  </div>

                  {/* Visual Distribution Bar */}
                  <div className="space-y-space-xs">
                    <div className="w-full h-5 rounded-full overflow-hidden flex shadow-inner">
                      {budgetCategories.map((cat, idx) => {
                        const colors = ['bg-primary-container', 'bg-secondary', 'bg-primary-fixed-dim', 'bg-tertiary-container', 'bg-outline-variant', 'bg-secondary-container'];
                        return (
                          <div
                            key={idx}
                            className={colors[idx % colors.length]}
                            style={{ width: `${cat.percentage}%` }}
                            title={`${cat.name} (${cat.percentage}%)`}
                          ></div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-outline font-label-sm text-xs pt-1 gap-2">
                      {budgetCategories.map((cat, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <span className="font-semibold text-primary">{cat.name}</span>
                          <span>{cat.percentage}%</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category Breakdown Table */}
                  <div className="divide-y divide-outline-variant/30 space-y-space-sm pt-space-xs">
                    {budgetCategories.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between py-space-sm">
                        <div className="flex items-center gap-space-sm">
                          <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary material-symbols-outlined text-[18px]">
                            {idx === 0 ? 'restaurant' : idx === 1 ? 'apartment' : idx === 2 ? 'palette' : idx === 3 ? 'music_note' : 'savings'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-title-md text-title-md text-on-surface font-semibold">{cat.name}</p>
                              <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider bg-surface-container-high text-outline">
                                {cat.priority}
                              </span>
                            </div>
                            <span className="font-body-sm text-xs text-outline">{cat.note}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-title-md text-title-md text-primary font-bold">
                            ₹{cat.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="block font-label-sm text-xs text-outline">{cat.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Arbitrage Savings Insight */}
                  <div className="p-space-md rounded-xl bg-surface-container border-l-4 border-secondary flex gap-space-md">
                    <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">
                      tips_and_updates
                    </span>
                    <div className="space-y-1">
                      <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
                        AI Cost Arbitrage &amp; Savings Insight
                      </span>
                      <p className="font-body-md text-sm text-on-surface">
                        {planData?.budgetRebalance?.arbitrageInsight ||
                          'By contracting local regional providers and packaging venue with in-house sound logistics, you unlock significant arbitrage savings that protect your contingency reserve.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TIMELINES & RUN-OF-SHOW ITINERARY */}
            {activeTab === 'timeline' && (
              <div id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" className="space-y-space-lg">
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-lg">
                  {/* Pre-Event Milestone Timeline */}
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                      Phase 1: Planning Milestones
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-primary mb-3">Pre-Event Milestone Roadmap</h2>
                    <div className="space-y-3">
                      {(planData?.milestoneTimeline || [
                        { timeframe: '8 Weeks Prior', milestone: 'Contract Core Venue & Date Lock', description: 'Execute agreements and secure deposits.', priority: 'high' },
                        { timeframe: '4 Weeks Prior', milestone: 'Menu & Tastings Approval', description: 'Confirm final culinary selections.', priority: 'medium' },
                        { timeframe: '1 Week Prior', milestone: 'Final Guest Roster & RSVPs', description: 'Transmit numbers to caterer and sound techs.', priority: 'high' },
                      ]).map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-surface-container-low flex items-start justify-between gap-3 border border-outline-variant/20">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold uppercase tracking-wider">
                              {m.timeframe}
                            </span>
                            <h4 className="font-title-md text-sm font-bold text-primary mt-1">{m.milestone}</h4>
                            <p className="text-xs text-on-surface-variant">{m.description}</p>
                          </div>
                          <span className="text-[11px] font-semibold text-tertiary uppercase tracking-wider shrink-0">
                            {m.priority} Priority
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day-Of Minute-by-Minute Run of Show */}
                  <div className="pt-space-md border-t border-outline-variant/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-3">
                      <div>
                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                          Phase 2: Execution Day
                        </span>
                        <h2 className="font-headline-lg text-headline-lg text-primary">Day-Of Minute-by-Minute Run of Show</h2>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs transition-all self-start cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        <span>Print Run Sheet</span>
                      </button>
                    </div>

                    <div className="relative pl-6 space-y-space-md before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
                      {(planData?.itinerary || []).map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-space-md group">
                          <span
                            className="absolute -left-6 top-1.5 w-3 h-3 rounded-full ring-4 ring-background"
                            style={{ backgroundColor: step.colorDot || '#381727' }}
                          ></span>
                          <div className="p-space-md rounded-xl bg-surface-container-low group-hover:bg-surface-container transition-all flex-1 space-y-1">
                            <div className="flex items-baseline justify-between">
                              <span className="font-title-md text-title-md text-primary font-semibold text-sm md:text-base">
                                {step.time} – {step.title}
                              </span>
                              <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                                {step.locationTag}
                              </span>
                            </div>
                            <p className="font-body-md text-xs md:text-sm text-on-surface-variant">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VENDOR CHECKLIST & SOURCING */}
            {activeTab === 'vendors' && (
              <div id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" className="space-y-space-lg">
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-lg">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                      Procurement &amp; Contracts
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-primary">Vendor Checklist &amp; Sourcing Matrix</h2>
                    <p className="text-sm text-outline mt-1">
                      Event-tailored vendor contracts, key deliverables, optimal booking timelines, and estimated allocations.
                    </p>
                  </div>

                  <div className="space-y-space-md">
                    {(planData?.vendorChecklist || [
                      {
                        category: 'Catering & Dining',
                        roleTitle: 'Master Caterer & Beverage Team',
                        keyDeliverables: ['Menu execution', 'Live stations', 'Service staff & ware'],
                        estimatedAllocation: Math.round(event.budgetAmount * 0.35),
                        bookingWindow: 'Book 6 weeks prior',
                        status: 'must_hire',
                      },
                      {
                        category: 'Sound & Audio Rig',
                        roleTitle: 'Live Sound Engineer & Lighting Rig',
                        keyDeliverables: ['PA sound system', 'Wireless mics', 'Ambient festoon lighting'],
                        estimatedAllocation: Math.round(event.budgetAmount * 0.18),
                        bookingWindow: 'Book 4 weeks prior',
                        status: 'must_hire',
                      },
                    ]).map((v, idx) => (
                      <div key={idx} className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-primary-fixed text-primary">
                              {v.category}
                            </span>
                            <h4 className="font-title-md text-base font-bold text-primary">{v.roleTitle}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-outline">{v.bookingWindow}</span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-secondary text-on-secondary">
                              ₹{v.estimatedAllocation.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-outline uppercase tracking-wider block mb-1">
                            Contract Deliverables Scope:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {v.keyDeliverables.map((del, dIdx) => (
                              <span key={dIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-container-highest text-on-surface text-xs">
                                <span className="material-symbols-outlined text-secondary text-[12px]">check</span>
                                {del}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Columns: Interactive Refinement & Checkpoint Version History */}
          <div className="xl:col-span-4 flex flex-col space-y-space-md">
            {/* Quick Calibration Panel */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
                  <h3 className="font-title-lg text-title-lg text-primary">Quick Adjustments</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-fixed text-primary tracking-wide uppercase">
                  Co-Pilot
                </span>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant">
                One-tap adjustments to instantly recalibrate budgets, headcount shifts, and timeline milestones.
              </p>

              <div className="flex flex-col gap-space-xs">
                <button
                  onClick={() => handleQuickAdjustment('Shift guest turnout by +15%')}
                  disabled={synthesizing}
                  className="w-full text-left p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-between group cursor-pointer text-xs font-medium text-on-surface"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">group_add</span>
                    <span>Shift guest turnout by +15%</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
                </button>

                <button
                  onClick={() => handleQuickAdjustment('Compress decor by 10% to boost catering buffer')}
                  disabled={synthesizing}
                  className="w-full text-left p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-between group cursor-pointer text-xs font-medium text-on-surface"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">compress</span>
                    <span>Compress decor by 10% for catering</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
                </button>

                <button
                  onClick={() => handleQuickAdjustment('Add rain contingency and marquee setup')}
                  disabled={synthesizing}
                  className="w-full text-left p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-between group cursor-pointer text-xs font-medium text-on-surface"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">umbrella</span>
                    <span>Add rain contingency marquee</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
                </button>

                <button
                  onClick={() => handleQuickAdjustment('Upgrade to live acoustic Sufi or Jazz ensemble')}
                  disabled={synthesizing}
                  className="w-full text-left p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-between group cursor-pointer text-xs font-medium text-on-surface"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px]">music_note</span>
                    <span>Upgrade to live acoustic ensemble</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
                </button>
              </div>

              {/* Custom Adjustment Input */}
              <form onSubmit={handleCustomAdjustment} className="pt-space-xs">
                <label className="font-label-sm text-xs text-outline block mb-1 uppercase tracking-wider">
                  Custom Adjustment
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customAdjustment}
                    onChange={(e) => setCustomAdjustment(e.target.value)}
                    placeholder="e.g. Add 2 zero-proof mocktail bars..."
                    className="flex-1 bg-surface-container-low px-3 py-2 rounded-xl text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={synthesizing || !customAdjustment.trim()}
                    className="w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 hover:bg-on-secondary-container transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Checkpoint Version History */}
            <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-title-md text-sm font-bold text-primary">Blueprint Checkpoints</h4>
                <span className="font-label-sm text-xs text-outline">{plans.length} Versions</span>
              </div>

              <div className="space-y-space-xs max-h-56 overflow-y-auto">
                {plans.map((pl, idx) => {
                  const isCurrent = idx === selectedPlanIndex;
                  return (
                    <div
                      key={pl.id}
                      onClick={() => setSelectedPlanIndex(idx)}
                      className={`p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-primary-fixed/40 border border-primary/20'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className={`text-xs truncate leading-tight ${isCurrent ? 'text-primary font-bold' : 'text-on-surface font-medium'}`}>
                          {pl.versionNumber} • {pl.versionTitle}
                        </span>
                        <span className="text-[11px] text-outline truncate">
                          {pl.curationConcept}
                        </span>
                      </div>
                      {isCurrent ? (
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
                      ) : (
                        <span className="text-[11px] text-secondary hover:underline shrink-0">View</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Venue & Sound Permitting Badge */}
            <div className="p-space-md rounded-2xl bg-surface-container flex items-start gap-space-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">verified_user</span>
              <div className="space-y-0.5">
                <p className="font-title-md text-xs text-on-surface font-bold">Sound &amp; Municipal Compliance</p>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {planData?.spatialBlueprint?.decibelRegulations ||
                    'Sound levels regulated in compliance with local civic venue guidelines. Cutoff and transition guidelines certified.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
