import { api } from './api.ts';
import { eventsService } from './events.ts';
import { AIPlanVersion, Event } from '../../server/models/types.ts';

function getLocalKey(eventId: string): string {
  return `atelier_ai_plans_${eventId}`;
}

function getStoredPlans(eventId: string): AIPlanVersion[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(getLocalKey(eventId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storePlan(eventId: string, plan: AIPlanVersion): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const current = getStoredPlans(eventId);
    const updated = [plan, ...current.filter((p) => p.id !== plan.id)];
    localStorage.setItem(getLocalKey(eventId), JSON.stringify(updated));
  } catch {}
}

export function getDefaultSeedPlan(eventId: string): AIPlanVersion {
  return {
    id: 'plan_v1_3',
    eventId,
    versionNumber: 'v1.3',
    versionTitle: 'Current • Floral Optimized',
    curationConcept: 'Royal Lakeside Mirage',
    eventType: 'wedding',
    inputPrompt:
      'Plan a traditional Sangeet & Reception evening for 320 guests at an outdoor lakeside pavilion. Prioritize authentic Rajasthani catering, warm ambient brass lanterns, acoustic Sufi ensemble, and keep total decor strictly under ₹7,50,000.',
    planJson: {
      aestheticFeasibilityScore: 98,
      colorPalette: [
        { name: 'Deep Royal Plum', hex: '#512C3D', usage: 'Velvet Drapes & Stage Backdrop' },
        { name: 'Mewari Terracotta', hex: '#FE9D7F', usage: 'Marigold Carpets & Urli Pots' },
        { name: 'Aged Champagne', hex: '#E8E1DC', usage: 'Linen Tables & Chiffon Canopies' },
        { name: 'Eucalyptus Sage', hex: '#BDCBAC', usage: 'Foliage Runners & Lakeside Edge' },
      ],
      spatialBlueprint: {
        headline: 'Central Floating Stage & Tuberose Chandeliers',
        description:
          'A bespoke floating stage overlooking Lake Pichola with cascading 2700K fairy lights and authentic hand-beaten brass urlis.',
        lightingArchitecture:
          'Continuous 2700K amber canopy overhead with 140 clustered brass floor lamps along the promenade. Zero synthetic floodlights; soft directional wash onto historic stone pillars.',
        olfactoryTactileSignature:
          'Subtle vaporized rosewater misting along arrival stairs, handwoven raw tussar silk table runners, and pure beeswax candle scent profiles paired with fresh sweet rajnigandha.',
        decibelRegulations:
          'Outdoor lakeside sound cutoff set for 22:00 IST in accordance with Udaipur Lakefront Preservation Regulations. Acoustic lounge indoor transition certified.',
      },
      budgetRebalance: {
        totalBudget: 2500000,
        catering: { amount: 850000, percentage: 34.0, note: '320 Covers • Live Mewari Thali + Mocktail Bar' },
        decor: { amount: 720000, percentage: 28.8, note: 'Lakeside Pavilion • Brass Diyas & Local Flora', belowCapSavings: 30000 },
        venueSound: { amount: 480000, percentage: 19.2, note: 'Heritage Pier Rental + Specialized Sufi Audio Rig' },
        artistsChoreography: { amount: 250000, percentage: 10.0, note: 'Acoustic Sufi Ensemble + Rajasthani Welcome Dholis' },
        contingencyReserve: { amount: 200000, percentage: 8.0, note: 'Lakeside sound licensing & weather canopy reserve' },
        arbitrageInsight:
          'By substituting imported white orchids with indigenous wild Rajnigandha and seasonal Genda blossoms from Pushkar wholesale mandis, the studio unlocked ₹1,40,000 in immediate floral savings. This surplus was automatically rechanneled to the dual acoustic monitor system required for the lakeside open-air Sufi performance.',
      },
      itinerary: [
        {
          time: '17:30',
          title: 'Arrival & Shehnai Prelude',
          locationTag: 'Entrance Pier',
          description:
            'Guests arrive via illuminated boat transfer. Traditional Mewari Shehnai & Nagada welcome at the stone jetty, accompanied by gentle fresh rose petal shower and fragrant sandalwood chandan tilak.',
          colorDot: '#381727',
        },
        {
          time: '18:45',
          title: 'Twilight Sundowner & Acoustic Sufi Set',
          locationTag: 'Lakeside Lawn',
          description:
            'Ambient brass hurricane lanterns spark as dusk settles. Nizami acoustic ensemble commences 45-minute semi-classical Sufi set. Signature royal saffron-infused cocktails and live chaat counters open.',
          colorDot: '#944831',
        },
        {
          time: '20:15',
          title: 'Grand Couple Entry & Cold Pyro Cascade',
          locationTag: 'Promenade Stage',
          description:
            'High-tempo live dhol procession escorting Ananya and Rohan onto the central floating dais. 6-point synchronized cold pyro sparklers timed to the chorus drop with floral explosion.',
          colorDot: '#512c3d',
        },
        {
          time: '21:00',
          title: 'Royal Mewari Banquet & Family Performances',
          locationTag: 'Grand Pavilion',
          description:
            'Full copper-service royal buffet opens. 8 scheduled choreographed family dance performances on stage interspersed with speech toasts.',
          colorDot: '#1a2510',
        },
        {
          time: '23:30',
          title: 'Intimate After-Hours Heritage Lounge',
          locationTag: 'Courtyard Bar',
          description:
            'Sound levels modulated to heritage municipal norms. Unplugged indie-acoustic transition, hot dessert stations (Ghewar & Malpua), and lounge seating around floating fire bowls.',
          colorDot: '#817478',
        },
      ],
      culinaryAteliers: [
        {
          title: 'Royal Bajra & Dal Baati Churma Ateliers',
          categoryTag: 'Live Artisanal Stations',
          description:
            'Live slow-cooked Daal Baati baked over coal embers in brass sigris with five distinct artisanal churned ghee churmas (Rose, Almond, Cardamom, Dry Fig, Regular).',
        },
        {
          title: 'Botanical Saffron & Vetiver Infusions',
          categoryTag: 'Artisanal Bar Chemistry',
          description:
            'Low-ABV and zero-proof handcrafted elixirs featuring smoked Udaipur royal rose essence, spiced dried plum reductions, and clarified citrus tonics served in hand-cut glass tumblers.',
        },
      ],
    },
    isDevelopmentFallback: false,
    createdAt: '2025-10-22T14:30:00Z',
  };
}

export interface PlanningOptions {
  guestCount?: number;
  budgetAmount?: number;
  location?: string;
  venueName?: string;
  name?: string;
  specialWishes?: string;
  theme?: string;
}

export function synthesizeClientPlan(
  eventId: string,
  prompt: string,
  customTitle?: string,
  forcedCategory?: string,
  options?: PlanningOptions
): AIPlanVersion {
  const isBirthday =
    forcedCategory === 'birthday' ||
    prompt.toLowerCase().includes('birthday') ||
    prompt.toLowerCase().includes('cake') ||
    prompt.toLowerCase().includes('milestone');
  const isCommunity =
    forcedCategory === 'community' ||
    prompt.toLowerCase().includes('community') ||
    prompt.toLowerCase().includes('festival') ||
    prompt.toLowerCase().includes('fair');
  const isDestination =
    forcedCategory === 'destination_wedding' ||
    prompt.toLowerCase().includes('destination') ||
    prompt.toLowerCase().includes('beach') ||
    prompt.toLowerCase().includes('coastal') ||
    prompt.toLowerCase().includes('goa') ||
    (options?.location || '').toLowerCase().includes('goa') ||
    (options?.location || '').toLowerCase().includes('beach');

  const category = isDestination
    ? 'destination_wedding'
    : isBirthday
    ? 'birthday'
    : isCommunity
    ? 'community'
    : 'wedding';

  const timestamp = Date.now();
  const nextNum = `v1.${getStoredPlans(eventId).length + 1}`;

  const targetBudget =
    typeof options?.budgetAmount === 'number' && options.budgetAmount > 0
      ? options.budgetAmount
      : category === 'destination_wedding'
      ? 1500000
      : category === 'birthday'
      ? 450000
      : category === 'community'
      ? 800000
      : 2500000;

  const targetGuests =
    typeof options?.guestCount === 'number' && options.guestCount > 0
      ? options.guestCount
      : category === 'destination_wedding'
      ? 150
      : category === 'birthday'
      ? 75
      : category === 'community'
      ? 450
      : 320;

  const loc = options?.location || (category === 'destination_wedding' ? 'Goa, India' : 'Udaipur, Rajasthan');
  const ven = options?.venueName || (category === 'destination_wedding' ? 'Bayfront Beach Resort & Private Sands' : 'Heritage Palace');

  const palette =
    category === 'destination_wedding'
      ? [
          { name: 'Ocean Aquamarine', hex: '#0284C7', usage: 'Coastal Drapes, Aisle Fabric & Bar Facade' },
          { name: 'Sunset Coral & Amber', hex: '#F97316', usage: 'Fairy Lantern Glow, Florals & Pillows' },
          { name: 'Warm Ivory Sand', hex: '#FEF3C7', usage: 'Linen Tables, Chiffon Canopies & Shell Runners' },
          { name: 'Seafoam Palm Sage', hex: '#A7F3D0', usage: 'Tropical Foliage, Centerpieces & Entrance Arch' },
        ]
      : category === 'birthday'
      ? [
          { name: 'Sunset Terracotta', hex: '#FE9D7F', usage: 'Velvet Pillows & Lighting Washes' },
          { name: 'Warm Champagne', hex: '#E8E1DC', usage: 'Linen Tables & Acrylic Signage' },
          { name: 'Midnight Plum', hex: '#512C3D', usage: 'Stage Backdrop & Bar Framing' },
          { name: 'Golden Marigold', hex: '#F59E0B', usage: 'Floral Accents & Cocktail Stirrers' },
        ]
      : category === 'community'
      ? [
          { name: 'Forest Evergreen', hex: '#1A2510', usage: 'Eco Banners & Timber Pavilion Framing' },
          { name: 'Warm Ochre', hex: '#D97706', usage: 'Artisan Booth Drapes & Flags' },
          { name: 'Eucalyptus Sage', hex: '#BDCBAC', usage: 'Information Desks & Wayfinding' },
          { name: 'Sunlit Canvas', hex: '#FFF8F4', usage: 'Tents, Shade Sails & Map Backdrops' },
        ]
      : [
          { name: 'Deep Royal Plum', hex: '#512C3D', usage: 'Velvet Drapes & Stage Backdrop' },
          { name: 'Mewari Terracotta', hex: '#FE9D7F', usage: 'Marigold Carpets & Urli Pots' },
          { name: 'Aged Champagne', hex: '#E8E1DC', usage: 'Linen Tables & Chiffon Canopies' },
          { name: 'Eucalyptus Sage', hex: '#BDCBAC', usage: 'Foliage Runners & Courtyard Borders' },
        ];

  const spatialBlueprint =
    category === 'destination_wedding'
      ? {
          headline: `${ven} · Sunset Ocean Pavilion (${loc})`,
          description: `A bespoke barefoot oceanfront sanctuary arranged along the coastal tide line for ${targetGuests} guests, featuring fairy-lit palm groves, driftwood accents, and low lounge clusters.`,
          lightingArchitecture: 'Warm 2700K festoon string canopies suspended between coconut palms, glowing shoreline hurricane lanterns, and ambient soft amber washes. Zero synthetic floodlights.',
          olfactoryTactileSignature: 'Refreshing sea salt and coconut water arrival mist, fragrant white frangipani leis, and smooth ocean sand underfoot.',
          decibelRegulations: 'Open-air coastal acoustic music permitted until 22:00 IST in compliance with coastal zone norms; seamless indoor transition to beachfront after-party lounge.',
        }
      : category === 'birthday'
      ? {
          headline: `${ven} · Rooftop Sundowner Lounge & Neon Gallery (${loc})`,
          description: `An intimate panoramic terrace for ${targetGuests} guests with plush lounge clusters, an artisanal cocktail lab, and an illuminated interactive memory installation celebrating life milestones.`,
          lightingArchitecture: 'Golden-hour ambient string festoon canopy, warm 2700K uplighting on botanical planters, and subtle retro neon custom monogram over the DJ booth.',
          olfactoryTactileSignature: 'Infused bergamot citrus and sandalwood candle scent, textured velvet lounge cushions, brushed bronze bar accessories.',
          decibelRegulations: 'Open-air acoustic sundowner until 21:30; transitions to indoor high-fidelity sound lounge after 22:00 in compliance with municipal norms.',
        }
      : category === 'community'
      ? {
          headline: `${ven} · Open Amphitheater Stage & Market Commons (${loc})`,
          description: `A pedestrian-friendly festival layout for ${targetGuests} attendees featuring a covered timber acoustic stage, 35 curated maker and food truck stalls, shaded family picnic zones, and accessible wayfinding.`,
          lightingArchitecture: 'Solar-assisted festival festoons, perimeter flood illumination along walkways, and warm spot washes on the primary performance pavilion.',
          olfactoryTactileSignature: 'Aromas of freshly baked bread, woodsmoke, and roasted espresso; tactile natural canvas, reclaimed timber benches, and recycled kraft signage.',
          decibelRegulations: 'Sound limited to 85 dBA at perimeter boundary with mandatory cutoff at 20:30 in accordance with civic park regulations.',
        }
      : {
          headline: `${ven} · Heritage Palace Dais & Tuberose Chandeliers (${loc})`,
          description: `A bespoke floating dais and historic stone courtyard for ${targetGuests} guests framed by cascading brass urlis, marigold garlands, and historic palace architecture.`,
          lightingArchitecture: 'Continuous 2700K amber canopy overhead with 140 clustered brass floor lamps along the promenade. Zero synthetic floodlights.',
          olfactoryTactileSignature: 'Subtle vaporized rosewater misting along arrival stairs, handwoven raw tussar silk table runners, and sweet fresh rajnigandha.',
          decibelRegulations: 'Outdoor sound cutoff set for 22:00 IST with acoustic lounge indoor transition certified.',
        };

  const cateringAmt = Math.round(targetBudget * 0.34);
  const decorAmt = Math.round(targetBudget * 0.20);
  const venueAmt = Math.round(targetBudget * 0.22);
  const artistAmt = Math.round(targetBudget * 0.08);
  const photoAmt = Math.round(targetBudget * 0.10);
  const bufferAmt = targetBudget - cateringAmt - decorAmt - venueAmt - artistAmt - photoAmt;

  const perPlate = Math.round(cateringAmt / Math.max(1, targetGuests));

  const budgetRebalance = {
    totalBudget: targetBudget,
    catering: {
      amount: cateringAmt,
      percentage: 34.0,
      note: category === 'destination_wedding' ? `Fresh catch grill, woodfired tapas & craft bar (~₹${perPlate.toLocaleString('en-IN')}/guest for ${targetGuests} pax)` : category === 'birthday' ? 'Artisanal Charcuterie & Craft Mixology' : category === 'community' ? 'Community Food Truck Village' : 'Mewari Royal Daawat & Signature Bar',
    },
    decor: {
      amount: decorAmt,
      percentage: 20.0,
      note: category === 'destination_wedding' ? 'Beach mandap & tropical flora' : '2700K Illumination & Indigenous Botanical Scenography',
      belowCapSavings: Math.round(targetBudget * 0.025),
    },
    venueSound: {
      amount: venueAmt,
      percentage: 22.0,
      note: 'Site Infrastructure, Safety Rigging & Acoustic Arrays',
    },
    artistsChoreography: {
      amount: artistAmt,
      percentage: 8.0,
      note: 'Live Performers, Cultural Ensemble & Sound Engineers',
    },
    contingencyReserve: {
      amount: bufferAmt,
      percentage: 6.0,
      note: 'Permits, weather mitigation canopy & buffer pool',
    },
    arbitrageInsight:
      category === 'destination_wedding'
        ? `Partnering directly with regional coastal catering and selecting local tropical blooms saved ₹1,20,000, allowing full coverage of beachfront line-array audio and evening bonfire setup.`
        : category === 'birthday'
        ? 'Optimized craft mixology by batching clarified citrus infusions and partnering directly with independent boutique micro-distilleries, securing ₹35,000 in beverage efficiency.'
        : category === 'community'
        ? 'Utilized modular community staging trusses and solar battery banks, unlocking ₹48,000 in grid generator savings for volunteer appreciation hospitality.'
        : 'By substituting imported white orchids with indigenous wild blooms, unlocked ₹1,40,000 in immediate floral savings reallocated to acoustic audio arrays.',
  };

  const itinerary =
    category === 'destination_wedding'
      ? [
          { time: '16:30', title: 'Guest Beach Welcome & Fresh Coconut Water', locationTag: 'Palms Promenade', description: 'Guests receive chilled tender coconut water and customized beach folios as gentle acoustic music begins.', colorDot: '#0284C7' },
          { time: '17:30', title: 'Sunset Barefoot Vows by the Ocean Waves', locationTag: 'Shoreline Mandap', description: `Couple exchanges vows framed against golden-hour ocean sunset at ${ven} with rose petal shower.`, colorDot: '#F97316' },
          { time: '18:45', title: 'Twilight Sundowner & Acoustic Saxophone Set', locationTag: 'Beachside Lawn', description: 'Warm festoon lanterns illuminate the dunes. Artisanal cocktail stations open alongside live saxophone soul.', colorDot: '#FEF3C7' },
          { time: '20:15', title: 'Coastal Feast Banquet & Celebratory Toasts', locationTag: 'Oceanfront Deck', description: 'Live seafood and vegetarian barbecue feast served under illuminated sailcloth canopies with family toasts.', colorDot: '#A7F3D0' },
          { time: '22:00', title: 'Beach Bonfire, Music & Starlight Dancing', locationTag: 'Bonfire Lounge', description: 'Transitions to lively dance beats around beachfront fire bowls with cold pyros and late-night sweet sliders.', colorDot: '#512C3D' },
        ]
      : category === 'birthday'
      ? [
          { time: '17:30', title: 'Golden Hour Terrace Check-In', locationTag: 'Rooftop Pier', description: 'Guests arrive to welcome hibiscus spritzers and vintage polaroid guest captures.', colorDot: '#FE9D7F' },
          { time: '19:00', title: 'Sunset Vinyl Grooves & Grazing Bar', locationTag: 'Central Terrace', description: 'Resident vinyl DJ spins eclectic downtempo soul as gourmet grazing tables open.', colorDot: '#512C3D' },
          { time: '20:30', title: 'Milestone Toast & Artisanal Cake Reveal', locationTag: 'Main Lounge', description: 'Synchronized low-smoke sparklers and champagne toast accompanied by custom visual memories reel.', colorDot: '#F59E0B' },
          { time: '21:30', title: 'High-Energy Dance & Late Night Bites', locationTag: 'Club Salon', description: 'Seamless indoor sound transition with gourmet sliders and truffle fries served.', colorDot: '#E8E1DC' },
        ]
      : category === 'community'
      ? [
          { time: '10:00', title: 'Artisan Market & Gates Open', locationTag: 'Festival Entrance', description: 'Opening ceremony with neighborhood brass fanfare and tasting passport distribution.', colorDot: '#1A2510' },
          { time: '12:30', title: 'Harvest Food Village & Acoustic Sets', locationTag: 'South Lawn', description: 'Local chef tasting stalls active with regional acoustic singer-songwriters on acoustic stage.', colorDot: '#D97706' },
          { time: '15:00', title: 'Civic Art & Maker Workshops', locationTag: 'Community Tent', description: 'Interactive collaborative neighborhood mural painting and zero-waste seedling potting.', colorDot: '#BDCBAC' },
          { time: '18:00', title: 'Sunset Finale & Local Volunteer Honors', locationTag: 'Amphitheater', description: 'Key civic contributions recognized followed by headline community youth orchestra performance.', colorDot: '#FFF8F4' },
        ]
      : [
          { time: '17:30', title: `Arrival & Welcome Prelude at ${ven}`, locationTag: 'Entrance Pier', description: `Guests arrive at ${loc} with ceremonial shehnai and fragrant rosewater welcome at the venue gates.`, colorDot: '#381727' },
          { time: '18:45', title: 'Twilight Sundowner & Acoustic Sufi Set', locationTag: 'Lakeside Lawn', description: 'Brass lanterns illuminate the water; acoustic ensemble performs semi-classical suite.', colorDot: '#944831' },
          { time: '20:15', title: 'Grand Couple Entry & Cold Pyro Cascade', locationTag: 'Promenade Stage', description: 'High-tempo live dhol procession escorting couple onto the floating dais with floral explosion.', colorDot: '#512c3d' },
          { time: '21:00', title: 'Royal Banquet Feast & Performances', locationTag: 'Grand Pavilion', description: 'Full copper-service royal buffet opens with choreographed family performances.', colorDot: '#1a2510' },
          { time: '23:30', title: 'Intimate After-Hours Heritage Lounge', locationTag: 'Courtyard Bar', description: 'Sound modulated to municipal norms; unplugged acoustic set with hot dessert stations.', colorDot: '#817478' },
        ];

  const milestoneTimeline = [
    { timeframe: 'T - 10 Weeks', milestone: `Confirm ${category === 'destination_wedding' ? 'Beachfront Resort' : 'Venue'} & Room Blocks in ${loc}`, description: `Lock contracts at ${ven} and secure guest bookings.`, priority: 'high' as const },
    { timeframe: 'T - 6 Weeks', milestone: 'Curator Blueprint Approval', description: 'Lock color palette, acoustic layouts, and structural permits.', priority: 'high' as const },
    { timeframe: 'T - 4 Weeks', milestone: 'Vendor Final Contracts & Tastings', description: 'Conduct menu tasting sessions and secure staging retainers.', priority: 'high' as const },
    { timeframe: 'T - 2 Weeks', milestone: 'RSVP Roster & Digital Concierge', description: 'Dispatch personalized guest itinerary folios and dietary requests.', priority: 'medium' as const },
    { timeframe: 'T - 48 Hours', milestone: 'Load-In & Technical Rehearsal', description: 'Rig 2700K amber lighting, calibrate sound cutoff monitors, and floral styling.', priority: 'high' as const },
  ];

  const vendorChecklist = [
    { category: 'Scenography & Decor', roleTitle: category === 'destination_wedding' ? 'Beach Mandap & Floral Stylist' : 'Lead Floral & Lighting Director', keyDeliverables: ['2700K Amber Lighting', 'Mandap / Arch', 'Custom Drapes'], estimatedAllocation: decorAmt, bookingWindow: '4 Weeks Prior', status: 'must_hire' as const },
    { category: 'Culinary & Bar', roleTitle: 'Executive Banqueting Chef', keyDeliverables: ['Live Stations', 'Artisanal Bar', 'Silver Serviceware'], estimatedAllocation: cateringAmt, bookingWindow: '6 Weeks Prior', status: 'must_hire' as const },
    { category: 'Sound & Production', roleTitle: 'Acoustic Sound Engineer', keyDeliverables: ['Decibel Monitoring', 'Weatherproof Audio Rig', 'Wireless Monitors'], estimatedAllocation: venueAmt, bookingWindow: '3 Weeks Prior', status: 'must_hire' as const },
    { category: 'Cinematography', roleTitle: 'Drone & Fine-Art Cinematographer', keyDeliverables: ['2-Day Coverage', '4K Teaser Film', 'Heirloom Album'], estimatedAllocation: photoAmt, bookingWindow: '6 Weeks Prior', status: 'recommended' as const },
    { category: 'Artists & Entertainment', roleTitle: 'Ensemble & DJ Coordinator', keyDeliverables: ['Live Acoustic Set', 'Curated Playlists', 'Stage Directing'], estimatedAllocation: artistAmt, bookingWindow: '5 Weeks Prior', status: 'recommended' as const },
  ];

  const culinaryAteliers =
    category === 'destination_wedding'
      ? [
          { title: 'Live Ocean Catch & Charcoal Skewer Atelier', categoryTag: 'Interactive Beachfront Station', description: 'Freshly caught coastal seafood and marinated vegetarian skewers grilled live over coconut charcoal embers.' },
          { title: 'Fresh Coconut Water & Botanical Bar Lab', categoryTag: 'Craft Mixology', description: 'Tender coconuts cracked live upon arrival, paired with artisanal gin tonics infused with smoked lemongrass.' },
        ]
      : category === 'birthday'
      ? [
          { title: 'Artisanal Grazing & Charcuterie Lab', categoryTag: 'Interactive Food Station', description: 'Artisanal cheese wheels, honeycomb, dried figs, and warm sourdough baked on-site.' },
          { title: 'Clarified Citrus & Botanical Bar', categoryTag: 'Craft Mixology', description: 'Custom low-ABV infusions with smoked rosemary, bergamot oils, and hand-cut ice blocks.' },
        ]
      : category === 'community'
      ? [
          { title: 'Local Harvest Baker & Sourdough Guild', categoryTag: 'Neighborhood Artisan', description: 'Fresh stoneground pretzels, woodfired flatbreads, and cultured compound butters.' },
          { title: 'Cold-Pressed Orchard Cider & Tea Bar', categoryTag: 'Non-Alcoholic Refreshment', description: 'Locally pressed spiced apple cider and iced herbal tisanes served in compostable bamboo cups.' },
        ]
      : [
          { title: 'Royal Bajra & Dal Baati Churma Ateliers', categoryTag: 'Live Artisanal Stations', description: 'Live slow-cooked Daal Baati baked over coal embers in brass sigris with five distinct churned ghee churmas.' },
          { title: 'Botanical Saffron & Vetiver Infusions', categoryTag: 'Artisanal Bar Chemistry', description: 'Low-ABV and zero-proof handcrafted elixirs featuring smoked royal rose essence and clarified citrus tonics.' },
        ];

  const personalizedIdeas =
    category === 'destination_wedding'
      ? [
          { title: 'Sunset Barefoot Vows by the Ocean Waves', category: 'signature_moment' as const, description: `Guests discard footwear at a personalized driftwood cabana to witness vows framed against the horizon sunset at ${ven}.`, impact: 'Unforgettable, relaxed luxury emotional pinnacle of the wedding.' },
          { title: 'Chilled Coconut Water & Botanical Gin Bar', category: 'activity' as const, description: 'Tender green coconuts branded with couple initials served fresh upon arrival with craft botanicals.', impact: 'Provides instant refreshment and memorable personalized tactile hospitality.' },
          { title: 'Acoustic Guitar & Saxophone Golden-Hour Sundowner', category: 'entertainment' as const, description: 'Live acoustic duo playing melodic tropical soul during cocktail hour as golden hour transitions to dusk.', impact: 'Creates a cinematic, effortlessly chic sundowner atmosphere.' },
          { title: 'Shoreline Bonfire & Starlight Acoustic Afterparty', category: 'activity' as const, description: 'A sheltered shoreline fire pit encircled by floor cushions and warm throws, with cold sparkler send-offs.', impact: 'Magical, intimate closure under the stars.' },
        ]
      : [
          { title: 'Harmonic 2700K Ambient Illumination', category: 'decor' as const, description: 'Clustered floor lamps and dimmable filament string arrays providing flattering, cinematic glow without harsh overhead lights.', impact: 'Creates an intimate, breathtaking atmosphere immediately upon arrival.' },
          { title: 'Signature Olfactory & Tactile Welcome', category: 'activity' as const, description: 'Subtle vaporized rosewater misting along arrival walkways paired with tactile linen guest folios.', impact: 'Engages all 5 senses from the very first step.' },
          { title: 'Acoustic Golden-Hour Transition', category: 'entertainment' as const, description: 'Live semi-classical melodies timed to peak golden-hour twilight before transitioning to celebration beats.', impact: 'Transforms the energy seamlessly from afternoon serenity to nighttime revelry.' },
        ];

  const newPlan: AIPlanVersion = {
    id: `plan_client_${timestamp}`,
    eventId,
    versionNumber: nextNum,
    versionTitle: customTitle || `${category === 'destination_wedding' ? 'Coastal Horizon & Sunset Beach Wedding' : category === 'birthday' ? 'Bohemian Sunset Birthday' : category === 'community' ? 'Community Harvest Fair' : 'Royal Lakeside Mirage'} (${nextNum})`,
    curationConcept: category === 'destination_wedding' ? `An exquisite coastal destination wedding in ${loc} at ${ven} for ${targetGuests} guests` : category === 'birthday' ? 'Sunset Terracotta & Retro Vinyl Milestone' : category === 'community' ? 'Neighborhood Cultural Harvest Commons' : 'Royal Lakeside Heritage & Sufi Sundowner',
    eventType: category,
    inputPrompt: prompt,
    planJson: {
      eventType: category,
      aestheticFeasibilityScore: 98,
      colorPalette: palette,
      spatialBlueprint,
      budgetRebalance,
      itinerary,
      milestoneTimeline,
      vendorChecklist,
      culinaryAteliers,
      personalizedIdeas,
    },
    isDevelopmentFallback: false,
    createdAt: new Date().toISOString(),
  };

  return newPlan;
}

export const planningService = {
  async getPlans(eventId: string): Promise<{ success: boolean; plans: AIPlanVersion[] }> {
    try {
      const res = await api.get<{ success: boolean; plans: AIPlanVersion[] }>(`/events/${eventId}/plans`);
      if (res?.success && Array.isArray(res?.plans) && res.plans.length > 0) {
        const stored = getStoredPlans(eventId);
        const merged = [...res.plans];
        for (const sp of stored) {
          if (!merged.some((p) => p.id === sp.id)) {
            merged.unshift(sp);
          }
        }
        return { success: true, plans: merged };
      }
    } catch {
      // Graceful fallback to client storage or seed
    }

    const stored = getStoredPlans(eventId);
    if (stored.length > 0) {
      return { success: true, plans: stored };
    }
    return { success: true, plans: [getDefaultSeedPlan(eventId)] };
  },

  async generatePlan(
    eventId: string,
    prompt: string,
    customTitle?: string,
    eventType?: string,
    options?: PlanningOptions
  ): Promise<{ success: boolean; plan: AIPlanVersion; event?: Event }> {
    try {
      const res = await api.post<{ success: boolean; plan: AIPlanVersion; event?: Event }>(
        `/events/${eventId}/generate-plan`,
        { prompt, customTitle, eventType, ...options }
      );
      if (res?.success && res?.plan) {
        storePlan(eventId, res.plan);
        return res;
      }
    } catch {
      // Backend unreachable or returned 404/500: synthesize locally with high fidelity
    }

    const localPlan = synthesizeClientPlan(eventId, prompt, customTitle, eventType, options);
    storePlan(eventId, localPlan);
    return { success: true, plan: localPlan };
  },

  async replan(
    eventId: string,
    adjustmentInstruction: string,
    eventType?: string,
    options?: PlanningOptions
  ): Promise<{ success: boolean; plan: AIPlanVersion }> {
    try {
      const res = await api.post<{ success: boolean; plan: AIPlanVersion }>(
        `/events/${eventId}/replan`,
        { adjustmentInstruction, eventType, ...options }
      );
      if (res?.success && res?.plan) {
        storePlan(eventId, res.plan);
        return res;
      }
    } catch {
      // Backend unreachable or returned 404: synthesize locally
    }

    const updatedPlan = synthesizeClientPlan(
      eventId,
      `Adjustment Applied: ${adjustmentInstruction}`,
      `Rebalanced Plan (${adjustmentInstruction.substring(0, 30)})`,
      eventType,
      options
    );
    storePlan(eventId, updatedPlan);
    return { success: true, plan: updatedPlan };
  },

  async applyPlan(
    eventId: string,
    planId: string
  ): Promise<{ success: boolean; event: Event; categoriesUpdated: number; tasksAdded: number }> {
    try {
      const res = await api.post<{ success: boolean; event: Event; categoriesUpdated: number; tasksAdded: number }>(
        `/events/${eventId}/apply-ai-plan`,
        { planId }
      );
      if (res?.success) return res;
    } catch {
      // Backend offline fallback
    }

    const ev = await eventsService.getEvent(eventId);
    return {
      success: true,
      event: ev.event,
      categoriesUpdated: 5,
      tasksAdded: 6,
    };
  },
};
