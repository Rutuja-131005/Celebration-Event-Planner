import React, { useState, useEffect } from 'react';
import { eventsService } from '../services/events.ts';
import { Event } from '../../server/models/types.ts';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Event, planGenerated?: boolean) => void;
}

interface PaletteOption {
  name: string;
  colors: string[];
}

const PALETTE_PRESETS: PaletteOption[] = [
  { name: 'Royal Crimson & Antique Gold', colors: ['#8B1E3F', '#D4AF37', '#F5EBE6'] },
  { name: 'Sunset Terracotta & Velvet Amber', colors: ['#C2410C', '#F59E0B', '#FEF3C7'] },
  { name: 'Emerald Twilight & Champagne', colors: ['#064E3B', '#10B981', '#E5E7EB'] },
  { name: 'Bohemian Botanical & Sage', colors: ['#3F6212', '#A3E635', '#F7FEE7'] },
  { name: 'Midnight Violet & Starlight Gold', colors: ['#4C1D95', '#A855F7', '#FDE047'] },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  // Preset Templates
  const [selectedPreset, setSelectedPreset] = useState<string>('wedding');

  // Core Logistics
  const [name, setName] = useState("Ananya & Rohan's Royal Heritage Wedding");
  const [eventType, setEventType] = useState('Royal Wedding Celebration');
  const [eventDate, setEventDate] = useState('2026-03-25');
  const [location, setLocation] = useState('Udaipur, Rajasthan');
  const [venueName, setVenueName] = useState('Jagmandir Island Palace, Lake Pichola');
  const [guestCount, setGuestCount] = useState<number>(320);
  const [budgetAmount, setBudgetAmount] = useState<number>(2500000);

  // Vibe & Aesthetics
  const [theme, setTheme] = useState('Royal Marwar & Rajputana Florals');
  const [selectedPalette, setSelectedPalette] = useState<string>(PALETTE_PRESETS[0].name);
  const [ambiance, setAmbiance] = useState('Lakeside candlelight, warm fairy lights, cascading marigolds & acoustic Sufi');
  const [vibe, setVibe] = useState('Opulent heritage grandeur with intimate candlelit hospitality');

  // Culinary & Entertainment
  const [culinaryStyle, setCulinaryStyle] = useState('Mewari royal feast, live charcoal kebabs, artisanal gin & cocktail bar');
  const [specialMoments, setSpecialMoments] = useState('Sunset boat procession, lakeside fireworks reveal & midnight acoustic session');
  const [additionalNotes, setAdditionalNotes] = useState('Ensure boat shuttles operate seamlessly from jetty; VIP dietary preferences noted');

  // All-in-One Blueprint Generation Switch
  const [autoGeneratePlan, setAutoGeneratePlan] = useState<boolean>(true);

  // Submission & Progress State
  const [submitting, setSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Focus restoration & Escape dismissal
  useEffect(() => {
    if (!isOpen) return;
    const prevActive = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (prevActive && typeof prevActive.focus === 'function') {
        prevActive.focus();
      }
    };
  }, [isOpen, onClose, submitting]);

  if (!isOpen) return null;

  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'wedding') {
      setName("Ananya & Rohan's Royal Heritage Wedding");
      setEventType('Royal Wedding Celebration');
      setEventDate('2026-03-25');
      setLocation('Udaipur, Rajasthan');
      setVenueName('Jagmandir Island Palace, Lake Pichola');
      setGuestCount(320);
      setBudgetAmount(2500000);
      setTheme('Royal Marwar & Rajputana Florals');
      setSelectedPalette(PALETTE_PRESETS[0].name);
      setAmbiance('Lakeside candlelight, warm brass lanterns & fragrant marigold arches');
      setVibe('Regal, majestic, and deeply romantic Indian heritage');
      setCulinaryStyle('Royal Mewari Thali banquet, live charcoal tandoor, artisanal mocktails');
      setSpecialMoments('Illuminated jetty arrival by boat, ceremonial shehnai & fireworks over the lake');
    } else if (presetKey === 'birthday') {
      setName("Aria's 30th Bohemian Sunset Gala");
      setEventType('Milestone Birthday Party');
      setEventDate('2026-04-18');
      setLocation('Bandra West, Mumbai');
      setVenueName('The Glass Horizon Penthouse & Rooftop');
      setGuestCount(85);
      setBudgetAmount(500000);
      setTheme('Sunset Terracotta, Amber Glow & Velvet Vinyl');
      setSelectedPalette(PALETTE_PRESETS[1].name);
      setAmbiance('Golden hour fairy lights, amber glass candles, velvet seating & vinyl listening lounge');
      setVibe('Chic, energetic, stylish and celebratory');
      setCulinaryStyle('Tapas grazing table, woodfired gourmet pizzas, craft cocktail tasting bar');
      setSpecialMoments('Surprise aerial champagne pour, polaroid memory wall & midnight DJ set');
    } else if (presetKey === 'community') {
      setName('Meadowbrook Cultural Harvest Festival');
      setEventType('Community Cultural Festival');
      setEventDate('2026-05-10');
      setLocation('Bengaluru, Karnataka');
      setVenueName('Central Park Commons & South Amphitheater');
      setGuestCount(500);
      setBudgetAmount(850000);
      setTheme('Forest Evergreen, Sunlit Canvas & Local Artisans');
      setSelectedPalette(PALETTE_PRESETS[3].name);
      setAmbiance('Open-air wooden pavilions, canvas bunting, festoon lighting & artisanal craft stalls');
      setVibe('Warm, vibrant, inclusive community spirit');
      setCulinaryStyle('Regional farm-to-table food trucks, artisanal bakery stalls, freshly pressed juices');
      setSpecialMoments('Community pottery workshop, sunset acoustic concert & lantern lighting');
    } else if (presetKey === 'charity') {
      setName('Luminary Hope Foundation Annual Gala');
      setEventType('Charity Gala & Fundraiser');
      setEventDate('2026-06-12');
      setLocation('New Delhi');
      setVenueName('The Grand Ballroom, Imperial Estate');
      setGuestCount(200);
      setBudgetAmount(1800000);
      setTheme('Emerald Twilight, Champagne & Velvet Stars');
      setSelectedPalette(PALETTE_PRESETS[2].name);
      setAmbiance('Crystal chandeliers, deep emerald velvet draping, soft amber up-lighting');
      setVibe('Prestigious, philanthropic and sophisticated');
      setCulinaryStyle('Fine dining 4-course plated banquet with premium wine pairings');
      setSpecialMoments('Live charity art auction, keynote impact film & classical cello ensemble');
    } else {
      setName('Bespoke Atelier Celebration');
      setEventType('Custom Atelier Celebration');
      setGuestCount(150);
      setBudgetAmount(1000000);
      setTheme('Modern Minimalist Elegance');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Celebration title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setProgressStep(1);

      // Simulate visible progress stages if auto-generating
      const progressTimer1 = setTimeout(() => setProgressStep(2), 700);
      const progressTimer2 = setTimeout(() => setProgressStep(3), 1400);
      const progressTimer3 = setTimeout(() => setProgressStep(4), 2100);

      const res = await eventsService.createEvent({
        name,
        eventType,
        eventDate,
        location,
        venueName,
        guestCount: Number(guestCount),
        budgetAmount: Number(budgetAmount),
        theme,
        autoGeneratePlan,
        vibe,
        ambiance,
        culinaryStyle,
        specialMoments,
        colorPalette: selectedPalette,
        additionalNotes,
      });

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      clearTimeout(progressTimer3);

      setProgressStep(5);

      if (res.success && res.event) {
        setTimeout(() => {
          onEventCreated(res.event, res.planApplied || !!res.plan);
          onClose();
        }, 500);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize celebration.';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-event-modal-title"
        className="bg-surface-container-lowest rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border border-outline-variant/40 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        
        {/* Modal Header */}
        <div className="p-6 pb-4 bg-gradient-to-r from-primary/10 via-surface-container-lowest to-secondary/10 border-b border-outline-variant/30 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-secondary text-[26px]" aria-hidden="true">auto_awesome</span>
            </div>
            <div>
              <h2 id="create-event-modal-title" className="font-headline-sm text-headline-sm text-primary font-bold">
                Design New Celebration &amp; Master Blueprint
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Enter your celebration parameters once — our AI Atelier synthesizes budgets, timelines, vendor checklists and creative concepts all together.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-outline hover:text-primary transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            type="button"
            aria-label="Close celebration designer dialog"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Modal Content - Scrollable Form */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
              Fast Track with Curated Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'wedding', label: 'Royal Wedding', icon: 'favorite', sub: '320 Guests · ₹25L' },
                { key: 'birthday', label: 'Milestone Birthday', icon: 'cake', sub: '85 Guests · ₹5L' },
                { key: 'community', label: 'Community Fair', icon: 'festival', sub: '500 Guests · ₹8.5L' },
                { key: 'charity', label: 'Charity Gala', icon: 'volunteer_activism', sub: '200 Guests · ₹18L' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.key)}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPreset === p.key
                      ? 'border-primary bg-primary/10 shadow-xs'
                      : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[18px] text-secondary">{p.icon}</span>
                    <span className="font-title-md text-xs font-bold text-on-surface truncate">{p.label}</span>
                  </div>
                  <span className="text-[11px] text-outline truncate">{p.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} id="create-event-form" className="space-y-6">
            
            {/* Section 1: Event Identity & Logistics */}
            <div className="bg-surface-container-low/60 p-4.5 rounded-2xl border border-outline-variant/30 space-y-3.5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">apartment</span>
                <span>1. Celebration Identity & Logistics</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                  Celebration Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya & Rohan's Royal Heritage Wedding"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-lowest px-3.5 py-2.5 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  >
                    <option value="Royal Wedding Celebration">Royal Wedding Celebration</option>
                    <option value="Milestone Birthday Party">Milestone Birthday Party</option>
                    <option value="Community Cultural Festival">Community Cultural Festival</option>
                    <option value="Charity Gala & Fundraiser">Charity Gala & Fundraiser</option>
                    <option value="Engagement Soirée">Engagement Soirée</option>
                    <option value="Bespoke Atelier Celebration">Bespoke Atelier Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Target Guest Count
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Total Budget (₹ INR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="25000"
                      required
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(Number(e.target.value))}
                      className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-secondary font-bold">
                      ₹{(budgetAmount / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    City / Destination
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Udaipur, Rajasthan"
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Jagmandir Island Palace"
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Aesthetic Theme, Ambiance & Palette */}
            <div className="bg-surface-container-low/60 p-4.5 rounded-2xl border border-outline-variant/30 space-y-3.5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">palette</span>
                <span>2. Aesthetic Narrative & Sensory Atmosphere</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Styling Theme Narrative
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g. Royal Marwar & Rajputana Florals"
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Vibe & Emotional Energy
                  </label>
                  <input
                    type="text"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    placeholder="e.g. Majestic, intimate romantic candlelit heritage"
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1.5">
                  Curated Color Palette Harmony
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PALETTE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setSelectedPalette(p.name)}
                      className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedPalette === p.name
                          ? 'border-primary bg-primary/10'
                          : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant'
                      }`}
                    >
                      <span className="text-xs font-medium text-on-surface truncate">{p.name}</span>
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {p.colors.map((c) => (
                          <span
                            key={c}
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                  Lighting, Floral & Sensory Ambiance
                </label>
                <input
                  type="text"
                  value={ambiance}
                  onChange={(e) => setAmbiance(e.target.value)}
                  placeholder="e.g. Lakeside candlelight, brass lanterns, cascading marigolds & Sufi instrumental"
                  className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Section 3: Culinary & Special Highlights */}
            <div className="bg-surface-container-low/60 p-4.5 rounded-2xl border border-outline-variant/30 space-y-3.5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                <span>3. Culinary Atelier & VIP Moments</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Culinary & Beverage Vision
                  </label>
                  <input
                    type="text"
                    value={culinaryStyle}
                    onChange={(e) => setCulinaryStyle(e.target.value)}
                    placeholder="e.g. 7-course royal feast, artisanal gin bar, dessert pavilion"
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                    Signature Moments & Highlights
                  </label>
                  <input
                    type="text"
                    value={specialMoments}
                    onChange={(e) => setSpecialMoments(e.target.value)}
                    placeholder="e.g. Boat arrival at golden hour, fireworks reveal, champagne toast"
                    className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-outline uppercase tracking-wider mb-1">
                  Special Notes & Guest Directives
                </label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Shuttle boat timings from jetty; acoustic volume limits after 10 PM"
                  className="w-full bg-surface-container-lowest px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Section 4: All-in-One Master Blueprint Toggle */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-secondary/15 via-primary/10 to-surface-container border border-secondary/40 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-[26px] mt-0.5">auto_awesome</span>
                <div>
                  <h4 className="font-title-md text-sm font-bold text-primary">
                    Synthesize Entire Master Blueprint All-in-One
                  </h4>
                  <p className="font-body-xs text-xs text-on-surface-variant">
                    Automatically computes 100% balanced budget categories, pre-event milestone roadmaps, hour-by-hour run-of-show, and vendor procurement tasks in one immediate pass.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={autoGeneratePlan}
                  onChange={(e) => setAutoGeneratePlan(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between">
          <div className="text-xs text-outline">
            {autoGeneratePlan
              ? '✨ Full master plan will be generated & applied instantly'
              : '⚡ Basic celebration shell will be initialized'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="create-event-form"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-on-primary text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">auto_awesome</span>
              <span>{submitting ? 'Synthesizing...' : 'Create & Generate Entire Plan'}</span>
            </button>
          </div>
        </div>

        {/* Synthesis Overlay when generating */}
        {submitting && (
          <div className="absolute inset-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-5 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <span className="material-symbols-outlined text-secondary text-[32px] absolute inset-0 flex items-center justify-center">
                auto_awesome
              </span>
            </div>

            <div className="text-center max-w-md space-y-1">
              <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                Synthesizing Master Celebration Blueprint
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Synthesizing budget formulas, spatial aesthetics, timelines and vendor checklists...
              </p>
            </div>

            {/* Stepper tracker */}
            <div className="w-full max-w-sm space-y-2 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-xs font-medium">
              {[
                { step: 1, label: 'Initializing celebration parameters...' },
                { step: 2, label: 'Curating sensory concept & color harmony...' },
                { step: 3, label: 'Computing 100% balanced budget allocations...' },
                { step: 4, label: 'Sequencing milestones & vendor checklist...' },
                { step: 5, label: 'Applying master blueprint to your atelier...' },
              ].map((s) => {
                const isDone = progressStep > s.step;
                const isCurrent = progressStep === s.step;
                return (
                  <div key={s.step} className="flex items-center gap-2.5">
                    {isDone ? (
                      <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                    ) : isCurrent ? (
                      <span className="material-symbols-outlined text-secondary text-[18px] animate-pulse">
                        hourglass_top
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline/40 text-[18px]">radio_button_unchecked</span>
                    )}
                    <span className={isDone ? 'text-on-surface' : isCurrent ? 'text-primary font-bold' : 'text-outline'}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
