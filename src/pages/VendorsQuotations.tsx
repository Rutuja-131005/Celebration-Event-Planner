import React, { useState } from 'react';
import { Event, Vendor, VendorQuote } from '../../server/models/types.ts';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('Decorators');
  const [searchQuery, setSearchQuery] = useState('Udaipur Heritage Wedding');
  const [recommendationAccepted, setRecommendationAccepted] = useState(false);
  const [escrowReleased, setEscrowReleased] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const categories = [
    { label: 'All Categories (18)', value: 'All' },
    { label: 'Venues (3)', value: 'Venues' },
    { label: 'Caterers (4)', value: 'Caterers' },
    { label: 'Decorators (4) • active', value: 'Decorators' },
    { label: 'Photographers (3)', value: 'Photographers' },
    { label: 'Entertainment (2)', value: 'Entertainment' },
    { label: 'Makeup & Styling (2)', value: 'Styling' },
  ];

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* PAGE HEADER & ACTION DOCK */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-sm">
          <div className="space-y-space-xs max-w-2xl">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Curated Atelier Network
              </span>
              <span className="font-label-sm text-label-sm text-outline">
                {event.name} Dossier
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Vendors &amp; Quotations
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Curate verified luxury hospitality partners, compare detailed quotes, and track booking milestones with editorial precision.
            </p>
          </div>

          {/* Dual Actions */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-sm transition-all group cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary group-hover:scale-110 transition-transform">
                balance
              </span>
              <span>
                Compare Quotes <span className="bg-primary text-on-primary text-label-sm px-1.5 py-0.5 rounded-full ml-1">2</span>
              </span>
            </button>
            <button
              onClick={onOpenAddQuote}
              className="inline-flex items-center gap-space-xs bg-primary text-on-primary hover:bg-primary-container px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-sm transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add Custom Quotation</span>
            </button>
          </div>
        </section>

        {/* SEARCH & FILTER TOOLBAR */}
        <section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md border border-outline-variant/30">
          <div className="flex flex-col md:flex-row gap-space-sm items-stretch">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors by name, service, or city (e.g. Udaipur, Jaipur, Mumbai)..."
                className="w-full pl-10 pr-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                className="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                <span>Filters</span>
                <span className="bg-secondary text-on-secondary text-label-sm rounded-full px-1.5">3</span>
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">swap_vert</span>
                <span className="hidden sm:inline">Sort:</span> Recommended
              </button>
            </div>
          </div>

          {/* Category Pills Filter Carousel */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 text-on-surface">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-space-md py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                  type="button"
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* FEATURED: SIDE-BY-SIDE QUOTATION COMPARISON PANEL */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm relative overflow-hidden border border-outline-variant/30">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-secondary-fixed/40 blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-md">
            <div className="space-y-0.5">
              <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md tracking-wider uppercase">
                <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                <span>Direct Quotation Head-to-Head</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary">
                Decor &amp; Scenography: Mandap &amp; Stage Evaluation
              </h2>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-body-sm text-body-sm text-outline">Target Budget: ₹6,00,000</span>
              <button
                onClick={() => window.print()}
                className="text-secondary hover:text-on-secondary-container font-label-md text-label-md inline-flex items-center gap-1 transition-colors cursor-pointer"
                type="button"
              >
                <span>Export Spec Sheet</span>
                <span className="material-symbols-outlined text-[16px]">download</span>
              </button>
            </div>
          </div>

          {/* AI Intelligence Recommendation Strip */}
          <div className="mb-space-lg p-space-md rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex flex-col sm:flex-row sm:items-center gap-space-sm shadow-sm">
            <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            </div>
            <div className="flex-1">
              <p className="font-title-md text-title-md leading-tight text-on-tertiary-fixed font-bold">
                Studio Co-Pilot Recommendation
              </p>
              <p className="font-body-sm text-body-sm text-on-tertiary-fixed-variant mt-0.5">
                <strong>Royal Rajputana Events</strong> delivers authentic Marwari heritage craftsmanship at{' '}
                <span className="font-semibold text-primary">₹80,000 lower net expenditure</span> with a verified 98% on-time floral arrival track record at Lake Pichola venues.
              </p>
            </div>
            <button
              onClick={() => setRecommendationAccepted(true)}
              className="sm:self-center bg-tertiary text-on-tertiary px-space-md py-1.5 rounded-xl font-label-md text-label-md hover:bg-tertiary-container transition-colors whitespace-nowrap cursor-pointer"
              type="button"
            >
              {recommendationAccepted ? 'Recommendation Accepted ✓' : 'Accept Recommendation'}
            </button>
          </div>

          {/* The 2-Column Comparison Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
            {/* Option A: Royal Rajputana Events */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between relative shadow-sm border border-tertiary-fixed">
              <div className="space-y-space-md">
                <div className="flex items-start justify-between gap-space-sm">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-label-sm text-label-sm mb-1 font-semibold">
                      Value &amp; Heritage Winner
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-primary">Royal Rajputana Events</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                      Lake Palace Road, Udaipur • 98% On-Time Score
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-body-sm text-body-sm text-outline block">Quoted Total</span>
                    <span className="font-headline-md text-headline-md text-secondary font-bold">₹5,30,000</span>
                    <span className="font-label-sm text-label-sm text-outline block">Taxes included</span>
                  </div>
                </div>

                {/* Deliverables Ledger */}
                <div className="space-y-space-xs bg-surface-container-lowest p-space-sm rounded-xl border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-1 font-semibold">
                    Contract Scope &amp; Inclusions
                  </span>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      20ft Hand-Carved Floral Mandap
                    </span>
                    <span className="text-outline">Mogra &amp; Marigold</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      400 Handcrafted Brass Diyas &amp; Urli Setups
                    </span>
                    <span className="text-outline">Brassware Provided</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      Fairy Canopy (1,200 sq.ft Courtyard)
                    </span>
                    <span className="text-outline">Warm 2700K Glow</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      2 Stage Setups (Varmala + Sangeet)
                    </span>
                    <span className="text-outline">Dual Truss</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1 opacity-70">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">do_not_disturb_on</span>
                      Imported Dutch Orchids / Peonies
                    </span>
                    <span className="text-outline font-label-sm">Add-on ₹90k</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-body-sm font-body-sm px-1 text-on-surface-variant">
                  <span>Payment Terms: 25% Advance / 50% Mid / 25% Wrap</span>
                  <span className="font-semibold text-tertiary">Valid until Nov 18</span>
                </div>
              </div>

              <div className="pt-space-md flex items-center gap-space-sm mt-space-sm">
                <button
                  onClick={() => alert('Contract agreement draft opened for Royal Rajputana Events.')}
                  className="flex-1 bg-primary text-on-primary hover:bg-primary-container py-2 rounded-xl font-title-md text-title-md text-center transition-colors cursor-pointer"
                  type="button"
                >
                  Select &amp; Draft Contract
                </button>
                <button
                  className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                  title="Message Partner"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                </button>
              </div>
            </div>

            {/* Option B: Virasat Floral & Decor */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between shadow-sm border border-outline-variant/30">
              <div className="space-y-space-md">
                <div className="flex items-start justify-between gap-space-sm">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm mb-1 font-semibold">
                      Luxury Contemporary Styling
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-primary">Virasat Floral &amp; Decor</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                      Hathi Pole, Udaipur • 94% On-Time Score
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-body-sm text-body-sm text-outline block">Quoted Total</span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">₹6,10,000</span>
                    <span className="font-label-sm text-label-sm text-error block">+18% GST Applicable</span>
                  </div>
                </div>

                {/* Deliverables Ledger */}
                <div className="space-y-space-xs bg-surface-container-lowest p-space-sm rounded-xl border border-outline-variant/30">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block mb-1 font-semibold">
                    Contract Scope &amp; Inclusions
                  </span>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      25ft Imported Flower Mandap (Ecuador Roses)
                    </span>
                    <span className="text-outline">High-density</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      Laser Light &amp; Kinetic Ceiling Rigging
                    </span>
                    <span className="text-outline">Sangeet Night</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      3 Bespoke Stage Setups (Mehendi, Haldi, Varmala)
                    </span>
                    <span className="text-outline">Turnkey</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1">
                    <span className="text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      Dedicated Floral Artisan Crew on Standby (12h)
                    </span>
                    <span className="text-outline">Included</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm font-body-sm py-1 opacity-70">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">do_not_disturb_on</span>
                      Brass Antique Urli Ware &amp; Floating Oil Wicks
                    </span>
                    <span className="text-outline font-label-sm">Self-sourced</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-body-sm font-body-sm px-1 text-on-surface-variant">
                  <span>Payment Terms: 40% Advance / 40% Setup / 20% Post</span>
                  <span className="font-semibold text-outline">Valid until Nov 14</span>
                </div>
              </div>

              <div className="pt-space-md flex items-center gap-space-sm mt-space-sm">
                <button
                  className="flex-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-2 rounded-xl font-title-md text-title-md text-center transition-colors cursor-pointer"
                  type="button"
                >
                  Keep Under Review
                </button>
                <button
                  className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                  title="Message Partner"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* VENDOR DIRECTORY CARDS GRID (EDITORIAL STYLE) */}
        <section className="space-y-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-space-sm">
              <h2 className="font-headline-md text-headline-md text-primary">Engaged &amp; Shortlisted Partners</h2>
              <span className="font-label-md text-label-md text-outline">4 of 18 showing in current itinerary</span>
            </div>
            <div className="flex items-center gap-2 text-label-md font-label-md text-secondary cursor-pointer hover:underline">
              <span>View Archival Catalog</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {/* CARD 1: The Vintage Frame Studio */}
            <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md border border-outline-variant/30">
              <div>
                <div className="relative h-44 overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    alt="The Vintage Frame Studio"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTNQmdvoE1hQRN07BGXwItCuJu3O4aVNWGrNUAjkfoAelDuapEKlVQ7YFRmQBK_5oapcQTzmNxSqHifqIF1tTv2FMyMw4-l_G_e5kw0CtUdxKvblbe8uzkrCv3WdnSXdWCHDcFsKQ546g9IYHykgVMAPL5erC1I_4FQOGwdJkrwjCoUz9BtI7o1hZTxEFpSJQQgQ-BersZ5_rsSTBrqm46VTDbJO7ZPBIBs6tSes7gA_zaNJuNiedvzg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">verified</span>
                      Verified Partner
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-on-primary">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">
                        Cinematography &amp; Stills
                      </span>
                      <h3 className="font-headline-sm text-headline-sm leading-tight">The Vintage Frame Studio</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-sm text-headline-sm font-bold">₹2,80,000</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md space-y-space-sm">
                  <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-outline">location_city</span>
                      Udaipur / Mumbai Studios
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-[16px] text-secondary">star</span>
                      4.9 (42 Royal Events)
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    Luxury Wedding Photography &amp; 4K Cinema. Inclusions cover 2 Full Shooting Days, Aerial Drone permissions, 1 Cinematic Teaser Film, and hand-bound Italian leather photobook.
                  </p>
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                      <span className="font-label-md text-label-md text-on-surface font-medium">Contract Signed · 30% Advance Paid</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">Ref #VF-2024-88</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span>Lead: <strong>Vikramaditya Rathore</strong></span>
                    <a className="text-secondary hover:underline flex items-center gap-1" href="tel:+919820144512">
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      +91 98201 44512
                    </a>
                  </div>
                </div>
              </div>

              <div className="px-space-md pb-space-md pt-space-xs flex items-center gap-space-sm bg-surface-container-lowest">
                <button
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-2 rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer"
                  type="button"
                >
                  View Signed Agreement
                </button>
                <button
                  className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  title="Download Invoice"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                </button>
              </div>
            </article>

            {/* CARD 2: Royal Mewari Catering */}
            <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md border border-outline-variant/30">
              <div>
                <div className="relative h-44 overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    alt="Royal Mewari Catering"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK3Pri2JjYTQoriXQeyW9VR1EyFt8CwAh4D6OoobsQjO54J83dM60IznrVWf5qC7_R5nKVmWs95xzECjgDWiEOlVWcftgHPx2Q9-fMmsxImGMb4aSohSmwZyy3Rg7wE6Ergpc5dNtr0RJ0D4m3XiV62HLkbjkU8hTyzZJJLF7_c-pZ31yqLyPesNWpOPyp-ScThshxnzR-dfdPof1g_OqiFTfEpOK3_SoqljIxURrtSg8CKkbaXVMUOQ"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">restaurant_menu</span>
                      Food Safety &amp; Heritage Certified
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-on-primary">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">
                        Royal Gastronomy
                      </span>
                      <h3 className="font-headline-sm text-headline-sm leading-tight">Royal Mewari Catering</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-sm text-headline-sm font-bold">₹7,60,000</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md space-y-space-sm">
                  <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-outline">location_city</span>
                      Lake Palace Road, Udaipur
                    </span>
                    <span className="font-label-md text-label-md text-on-surface">
                      ₹2,200 / Plate (320 Pax Guaranteed)
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    Curated Royal Rajasthani Daawat featuring Dal Baati Churma, Laal Maas, and interactive live Pan-Asian wok counters for the Sangeet night banquet.
                  </p>
                  <div className="p-space-sm rounded-xl bg-secondary-fixed/50 flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px] text-secondary">event_available</span>
                      <span className="font-label-md text-label-md text-on-secondary-fixed font-semibold">
                        Menu Tasting Confirmed for Nov 12
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary">5 Chef Selection</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span>F&amp;B Director: <strong>Maharaj Shivraj</strong></span>
                    <span className="text-tertiary font-label-md font-medium">Lic. FSSAI #21419</span>
                  </div>
                </div>
              </div>

              <div className="px-space-md pb-space-md pt-space-xs flex items-center gap-space-sm bg-surface-container-lowest">
                <button
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-2 rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer"
                  type="button"
                >
                  Review 6-Course Menu
                </button>
                <button
                  className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  title="Add Dietary Note"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </button>
              </div>
            </article>

            {/* CARD 3: Svaram Folk & Sufi Ensemble */}
            <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md border border-outline-variant/30">
              <div>
                <div className="relative h-44 overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    alt="Svaram Folk & Sufi Ensemble"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsfu2a_xoqA5FF3gugrDbhX2HP2YTCHdMQy9-MqhKSZOLHyEXmqTgkZOAD4KzmKaBM-lgJ31jIpqRcVyqdfBqRTqQ9wMRjMOtUwxqp1AmyiaF7TxQxTPZbcFa9meagCQJX0yzRQnXWBUVr8fMrWILinCA_GtjnxUWQq2MLsTZJ8RYikOlg2m4fJYO6m9yaKepV3Yh_jjoD1996T-ghCudPU1EdjVg3JdLudHHyOGbGgNskM6qGK3bm0A"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">music_note</span>
                      Live Performance
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-on-primary">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">
                        7-Piece Acoustic Troupe
                      </span>
                      <h3 className="font-headline-sm text-headline-sm leading-tight">Svaram Folk &amp; Sufi Ensemble</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-sm text-headline-sm font-bold">₹1,50,000</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md space-y-space-sm">
                  <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                      3.5 Hours Set • Sangeet Night
                    </span>
                    <span className="font-label-md text-label-md text-tertiary">Sound Tech Included</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    Mesmerizing blend of Manganiyar folk ballads, contemporary Sufi qawwalis, and soulful ambient sitar interludes during dinner reception.
                  </p>
                  <div className="p-space-sm rounded-xl bg-surface-container-high flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[16px] text-outline">pending_actions</span>
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        Awaiting Technical Rider Review
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">Stage size 18x12ft</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span>Band Manager: <strong>Kabir Qureshi</strong></span>
                    <span className="text-secondary font-label-md font-medium cursor-pointer hover:underline">
                      Listen to Demo Tape
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-space-md pb-space-md pt-space-xs flex items-center gap-space-sm bg-surface-container-lowest">
                <button
                  className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-2 rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer"
                  type="button"
                >
                  Approve Technical Rider
                </button>
                <button
                  className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  title="Setlist Editor"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">queue_music</span>
                </button>
              </div>
            </article>

            {/* CARD 4: Shringar Bridal Styling */}
            <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md border border-outline-variant/30">
              <div>
                <div className="relative h-44 overflow-hidden bg-surface-container">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    alt="Shringar Bridal Styling"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx7Ukm-cdmiDbzqtT6JcT3lJEl-qYhKlEQWb78_pVkfDo7mxTxoh7IroA-lg8F2yY90GA1XM9GBaoT-0Ar7jSd1v8v9xsob_NCRU8myMSmSeOT64lGOJmBinn1Dd-YgFrhZt30Bqlf5Jxff3eJoiz6KnFp7yrkdrZTXlBQmnsB6G_ZPhxD-5DPVtvY3pb9mEssXr5M6KVDsqxoyqOFjTxxwXXfq2qCikZNsyjjINdqvoYGLaPqaaVTAA"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-sm text-label-sm px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-secondary">brush</span>
                      Bridal &amp; Groom Couture
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-on-primary">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">
                        Styling &amp; Draping
                      </span>
                      <h3 className="font-headline-sm text-headline-sm leading-tight">Shringar Bridal Styling</h3>
                    </div>
                    <div className="text-right">
                      <span className="font-headline-sm text-headline-sm font-bold">₹85,000</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md space-y-space-sm">
                  <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-outline">spa</span>
                      HD Airbrush &amp; Saree Draper
                    </span>
                    <span className="font-label-md text-label-md text-outline">3 Functions</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    Complete bespoke styling dossier for Ananya (Bride) and family styling assistance (3 Pax). Includes on-location vanity touch-ups during Varmala ceremonies.
                  </p>
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        Quotation Received · Under Review
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">Rec'd yesterday</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 font-body-sm text-body-sm text-on-surface-variant">
                    <span>Lead Artist: <strong>Meera Kapoor</strong></span>
                    <span className="text-secondary font-label-md font-medium cursor-pointer hover:underline">
                      View Portfolio Reel
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-space-md pb-space-md pt-space-xs flex items-center gap-space-sm bg-surface-container-lowest">
                <button
                  className="flex-1 bg-primary text-on-primary hover:bg-primary-container py-2 rounded-xl font-label-lg text-label-lg transition-colors cursor-pointer"
                  type="button"
                >
                  Request Trial Session
                </button>
                <button
                  className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  title="Share with Bride"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            </article>
          </div>
        </section>

        {/* CONTRACT & PAYMENT MILESTONE CHECKLIST */}
        <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm space-y-space-lg border border-outline-variant/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div className="space-y-0.5">
              <div className="flex items-center gap-space-xs text-tertiary font-label-md text-label-md uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                <span>Financial Milestones</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary">
                Vendor Disbursements &amp; Escrow Schedule
              </h2>
            </div>

            {/* Overall Payment Progress Summary */}
            <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-2 rounded-xl">
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-outline block">Total Committed</span>
                <span className="font-title-md text-title-md text-on-surface font-bold">₹12,45,000 / ₹18.5L</span>
              </div>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-variant"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  ></path>
                  <path
                    className="text-secondary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="67, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>
                </svg>
                <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">67%</span>
              </div>
            </div>
          </div>

          {/* Milestone Steps Timeline Table */}
          <div className="space-y-space-xs">
            {/* Milestone Item 1: Complete */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low gap-space-sm hover:bg-surface-container transition-colors">
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h4 className="font-title-md text-title-md text-on-surface">Initial Booking Advance: The Vintage Frame Studio</h4>
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full">
                      Paid
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    30% retainer to reserve primary cinematographers for Dec 14–16, 2024
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-space-lg pl-12 sm:pl-0">
                <div className="sm:text-right">
                  <span className="font-title-md text-title-md font-bold text-on-surface">₹84,000</span>
                  <span className="font-body-sm text-body-sm text-outline block">Cleared Oct 28</span>
                </div>
                <button className="text-outline hover:text-on-surface p-1 rounded cursor-pointer" type="button">
                  <span className="material-symbols-outlined text-[20px]">receipt</span>
                </button>
              </div>
            </div>

            {/* Milestone Item 2: Imminent / Actionable */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-secondary-fixed/30 gap-space-sm">
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">priority_high</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h4 className="font-title-md text-title-md text-on-surface">Decor Retainer: Royal Rajputana Events</h4>
                    <span className="bg-secondary text-on-secondary font-label-sm text-label-sm px-2 py-0.5 rounded-full">
                      {escrowReleased ? 'Released' : 'Due in 4 Days'}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    25% mandatory advance to initiate custom woodcraft carving for mandap pillars
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-space-lg pl-12 sm:pl-0">
                <div className="sm:text-right">
                  <span className="font-title-md text-title-md font-bold text-secondary">₹1,32,500</span>
                  <span className="font-body-sm text-body-sm text-secondary font-medium block">Due Nov 15</span>
                </div>
                <button
                  onClick={() => setEscrowReleased(true)}
                  className={`px-space-sm py-1 rounded-xl font-label-md text-label-md transition-colors cursor-pointer ${
                    escrowReleased
                      ? 'bg-tertiary text-on-tertiary'
                      : 'bg-secondary text-on-secondary hover:bg-on-secondary-container'
                  }`}
                  type="button"
                >
                  {escrowReleased ? 'Escrow Released ✓' : 'Release Escrow'}
                </button>
              </div>
            </div>

            {/* Milestone Item 3: Upcoming */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low gap-space-sm hover:bg-surface-container transition-colors">
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-8 h-8 rounded-full bg-surface-variant text-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h4 className="font-title-md text-title-md text-on-surface">Catering 50% Staging Advance: Royal Mewari</h4>
                    <span className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full">
                      Scheduled
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Contingent upon guest sign-off at Nov 12 menu tasting session
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-space-lg pl-12 sm:pl-0">
                <div className="sm:text-right">
                  <span className="font-title-md text-title-md font-bold text-on-surface">₹3,80,000</span>
                  <span className="font-body-sm text-body-sm text-outline block">Scheduled Nov 20</span>
                </div>
                <button className="text-outline hover:text-on-surface p-1 rounded cursor-pointer" type="button">
                  <span className="material-symbols-outlined text-[20px]">tune</span>
                </button>
              </div>
            </div>

            {/* Milestone Item 4: Final Clearance */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low gap-space-sm hover:bg-surface-container transition-colors">
              <div className="flex items-start sm:items-center gap-space-md">
                <div className="w-8 h-8 rounded-full bg-surface-variant text-outline flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <h4 className="font-title-md text-title-md text-on-surface">Final Event-Day Vendor Settlements &amp; Security Release</h4>
                    <span className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full">
                      On Completion
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Post-inspection clearance for sound decibel adherence &amp; venue inventory sign-off
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-space-lg pl-12 sm:pl-0">
                <div className="sm:text-right">
                  <span className="font-title-md text-title-md font-bold text-on-surface">₹6,48,500</span>
                  <span className="font-body-sm text-body-sm text-outline block">Dec 17, 2024</span>
                </div>
                <button className="text-outline hover:text-on-surface p-1 rounded cursor-pointer" type="button">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sample Data Disclosure Bar */}
          <div className="p-space-sm rounded-xl bg-surface-container flex items-center gap-space-sm text-outline">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <p className="font-body-sm text-body-sm">
              Showing verified partner sample rates calibrated for Udaipur luxury venues. All contracts governed under standard Atelier Hospitality Service Level Agreements.
            </p>
          </div>
        </section>

        {/* Modal for side-by-side comparison modal if triggered */}
        {showCompareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-space-lg shadow-2xl border border-outline-variant/40 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">balance</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Head-to-Head Comparison Matrix</h3>
                </div>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-outline hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-surface-container-low border border-tertiary-fixed">
                  <h4 className="font-bold text-primary mb-1">Royal Rajputana Events</h4>
                  <p className="text-secondary font-bold text-lg">₹5,30,000</p>
                  <p className="text-xs text-outline mb-2">Taxes Included</p>
                  <ul className="space-y-1 text-xs text-on-surface">
                    <li>✓ 20ft Floral Mandap</li>
                    <li>✓ 400 Brass Diyas & Urlis</li>
                    <li>✓ 2 Stage Setups included</li>
                    <li>✓ 98% On-time track record</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <h4 className="font-bold text-primary mb-1">Virasat Floral & Decor</h4>
                  <p className="text-primary font-bold text-lg">₹6,10,000</p>
                  <p className="text-xs text-error mb-2">+18% GST Applicable</p>
                  <ul className="space-y-1 text-xs text-on-surface">
                    <li>✓ 25ft Imported Flower Mandap</li>
                    <li>✓ Laser light kinetic truss</li>
                    <li>✓ 3 stage setups</li>
                    <li>✗ Brassware self-sourced</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-sm cursor-pointer"
                >
                  Close Matrix
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
