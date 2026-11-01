import React, { useState, useEffect } from 'react';
import { Event, AIPlanVersion } from '../../server/models/types.ts';
import { planningService, getDefaultSeedPlan } from '../services/planning.ts';
import { StudioHeader } from '../components/studio/StudioHeader.tsx';
import { StudioConfigurator } from '../components/studio/StudioConfigurator.tsx';
import { BlueprintHeroBar } from '../components/studio/BlueprintHeroBar.tsx';
import { AtmosphereTab } from '../components/studio/AtmosphereTab.tsx';
import { BudgetAllocationTab } from '../components/studio/BudgetAllocationTab.tsx';
import { TimelineTab } from '../components/studio/TimelineTab.tsx';
import { VendorsTab } from '../components/studio/VendorsTab.tsx';
import { StudioCopilotSidebar } from '../components/studio/StudioCopilotSidebar.tsx';
import { logger } from '../utils/logger.ts';

interface AIPlanningStudioProps {
  event: Event;
  plans: AIPlanVersion[];
  onRefreshPlans: () => void;
  onEventUpdated?: (updatedEvent: Event) => void;
  onNavigateTab?: (path: string) => void;
}

/**
 * AI Planning Studio coordinator page: decomposes synthesis into dedicated,
 * modular presentation sub-components adhering to single-responsibility architecture.
 */
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
  const [eventTypeCategory, setEventTypeCategory] = useState<'destination_wedding' | 'wedding' | 'birthday' | 'community' | 'custom'>('wedding');
  const [eventTitle, setEventTitle] = useState(event.name);
  const [guestCount, setGuestCount] = useState<number | string>(event.guestCount);
  const [budgetAmount, setBudgetAmount] = useState<number | string>(event.budgetAmount);
  const [locationName, setLocationName] = useState(event.location);
  const [venueName, setVenueName] = useState(event.venueName);
  const [specialWishes, setSpecialWishes] = useState<string>(
    (typeof event.eventPreferences?.specialMoments === 'string' ? event.eventPreferences.specialMoments : '') || ''
  );
  const [promptText, setPromptText] = useState(
    'Plan an unforgettable luxury celebration. Prioritize authentic culinary stations, harmonic 2700K ambient illumination, signature guest activities, and optimize floral and sound production below budget cap.'
  );

  const [customAdjustment, setCustomAdjustment] = useState('');
  const [synthesizing, setSynthesizing] = useState(false);
  const [applyingPlan, setApplyingPlan] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Synchronize local input state whenever selected event changes
  useEffect(() => {
    if (event) {
      setEventTitle(event.name || '');
      setGuestCount(event.guestCount || 150);
      setBudgetAmount(event.budgetAmount || 1500000);
      setLocationName(event.location || '');
      setVenueName(event.venueName || '');
      const evType = (event.eventType || '').toLowerCase();
      if (evType.includes('destination') || evType.includes('beach') || evType.includes('coastal')) {
        setEventTypeCategory('destination_wedding');
        setSpecialWishes('Sunset barefoot vows by the ocean waves, fairy-lit palm grove, acoustic guitar & coastal seafood grill');
      } else if (evType.includes('birthday')) {
        setEventTypeCategory('birthday');
      } else if (evType.includes('community') || evType.includes('festival') || evType.includes('fair')) {
        setEventTypeCategory('community');
      } else {
        setEventTypeCategory('wedding');
      }
    }
  }, [event.id, event.name, event.guestCount, event.budgetAmount, event.location, event.venueName, event.eventType]);

  const activePlanList = plans.length > 0 ? plans : [getDefaultSeedPlan(event.id)];
  const currentPlan: AIPlanVersion = activePlanList[selectedPlanIndex] || activePlanList[0];
  const planData = currentPlan?.planJson;

  // Preset Handlers for challenge domains
  const handleLoadPreset = (type: 'destination_wedding' | 'wedding' | 'birthday' | 'community') => {
    setEventTypeCategory(type);
    setError(null);
    setApplySuccessMessage(null);

    if (type === 'destination_wedding') {
      setEventTitle("Aarav & Maya's Destination Beach Wedding");
      setGuestCount(150);
      setBudgetAmount(1500000);
      setLocationName('Goa, India');
      setVenueName('Bayfront Beach Resort & Private Sands, Morjim');
      setSpecialWishes('Barefoot vows by the ocean waves, fairy-lit palm grove, acoustic sundowner & fresh seafood grill');
      setPromptText('Plan an unforgettable luxury beach destination wedding in Goa for 150 guests. Prioritize barefoot oceanfront ceremony, ambient lantern lighting, coastal seafood banquet, acoustic guitar sundowner, and beach bonfire party.');
    } else if (type === 'wedding') {
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

      const numericGuestCount = Number(guestCount) || 100;
      const numericBudget = Number(budgetAmount) || 1500000;

      const combinedPrompt = `${promptText} | Event Title: ${eventTitle} | Type: ${eventTypeCategory} | Destination / Location: ${locationName} | Venue: ${venueName} | Guests: ${numericGuestCount} | Target Budget: ₹${numericBudget.toLocaleString('en-IN')} | Special Parameters: ${specialWishes}`;

      const res = await planningService.generatePlan(
        event.id,
        combinedPrompt,
        `${eventTitle} (${eventTypeCategory.toUpperCase().replace('_', ' ')})`,
        eventTypeCategory,
        {
          guestCount: numericGuestCount,
          budgetAmount: numericBudget,
          location: locationName,
          venueName: venueName,
          name: eventTitle,
          specialWishes,
        }
      );

      if (res.success && res.plan) {
        onRefreshPlans();
        setSelectedPlanIndex(0);
        if (onEventUpdated && res.event) {
          onEventUpdated(res.event);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'GenAI plan synthesis failed.';
      logger.error('GenAI plan synthesis failed', err);
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply plan to active event.';
      logger.error('Failed to apply plan to active event', err);
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Quick adjustment failed.';
      logger.error('Quick adjustment failed', err);
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Custom adjustment failed.';
      logger.error('Custom adjustment failed', err);
      setError(message);
    } finally {
      setSynthesizing(false);
    }
  };

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
        {/* Studio Header */}
        <StudioHeader event={event} eventTypeCategory={eventTypeCategory} />

        {/* Input Panel Configurator */}
        <StudioConfigurator
          eventTypeCategory={eventTypeCategory}
          eventTitle={eventTitle}
          setEventTitle={setEventTitle}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          budgetAmount={budgetAmount}
          setBudgetAmount={setBudgetAmount}
          locationName={locationName}
          setLocationName={setLocationName}
          venueName={venueName}
          setVenueName={setVenueName}
          specialWishes={specialWishes}
          setSpecialWishes={setSpecialWishes}
          promptText={promptText}
          setPromptText={setPromptText}
          synthesizing={synthesizing}
          applyingPlan={applyingPlan}
          applySuccessMessage={applySuccessMessage}
          error={error}
          currentPlan={currentPlan}
          onLoadPreset={handleLoadPreset}
          onSynthesize={handleSynthesize}
          onNavigateTab={onNavigateTab}
        />

        {/* Output Blueprint & 4 Pillar Tabs */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
          <div className="xl:col-span-8 flex flex-col space-y-space-lg">
            {/* Quick Action: Apply Plan to Active Event */}
            <BlueprintHeroBar
              currentPlan={currentPlan}
              applyingPlan={applyingPlan}
              onApplyPlan={handleApplyPlanToEvent}
            />

            {/* Studio Tabs Navigation */}
            <div
              role="tablist"
              aria-label="Planning Studio Dimensions"
              className="flex items-center justify-between pb-space-xs border-b border-outline-variant/40 overflow-x-auto"
            >
              <div className="flex items-center gap-space-xs">
                {[
                  { id: 'ideas' as const, label: 'Personalized Ideas', icon: 'lightbulb' },
                  { id: 'budget' as const, label: 'Budget Allocation', icon: 'payments' },
                  { id: 'timeline' as const, label: 'Timelines & Run-of-Show', icon: 'schedule' },
                  { id: 'vendors' as const, label: 'Vendor Checklist', icon: 'checklist' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-space-md py-space-sm rounded-t-xl font-title-md text-sm md:text-base flex items-center gap-2 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'active text-primary bg-surface-container-lowest shadow-[0_-2px_8px_rgba(81,44,61,0.04)] border-t border-x border-outline-variant/40'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pillar Panels */}
            {activeTab === 'ideas' && <AtmosphereTab currentPlan={currentPlan} />}
            {activeTab === 'budget' && (
              <BudgetAllocationTab
                totalBudget={planData?.budgetRebalance?.totalBudget || event.budgetAmount}
                budgetCategories={budgetCategories}
                currentPlan={currentPlan}
              />
            )}
            {activeTab === 'timeline' && <TimelineTab currentPlan={currentPlan} />}
            {activeTab === 'vendors' && (
              <VendorsTab currentPlan={currentPlan} defaultBudget={event.budgetAmount} />
            )}
          </div>

          {/* Right Column: Interactive Copilot Sidebar */}
          <StudioCopilotSidebar
            plans={plans}
            selectedPlanIndex={selectedPlanIndex}
            onSelectPlanIndex={setSelectedPlanIndex}
            customAdjustment={customAdjustment}
            setCustomAdjustment={setCustomAdjustment}
            synthesizing={synthesizing}
            onQuickAdjustment={handleQuickAdjustment}
            onCustomAdjustment={handleCustomAdjustment}
            decibelRegulations={planData?.spatialBlueprint?.decibelRegulations}
          />
        </div>
      </div>
    </div>
  );
};
