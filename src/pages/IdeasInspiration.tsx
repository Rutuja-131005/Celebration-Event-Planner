import React, { useState } from 'react';

export const IdeasInspiration: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'wedding' | 'birthday' | 'community'>('all');
  const [customIdeaInput, setCustomIdeaInput] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<Array<{
    title: string;
    type: 'wedding' | 'birthday' | 'community';
    category: string;
    description: string;
    impact: string;
    image: string;
  }>>([]);

  const baseIdeas = [
    // Weddings
    {
      title: 'Floating Lotus Mandap & Tuberose Dais',
      type: 'wedding' as const,
      category: 'Scenography & Mandap',
      description: 'Lakeside water platform framed by 400 floating brass urlis, indigenous sweet rajnigandha garlands, and pure beeswax candle wicks.',
      impact: 'Fairytale reflection on water creating an unforgettable romantic ceremony.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhmcMKS77C9dL5wZYMnkJM_wtjHoi8LHz3yObEIDEfXSUNMNh3PCTI2SAgBOc_TGKgCzTxnr3h9l166C6dXiHHv8PMjEmembF5TJK7I86FJV2D5mXtf3qYAPi_Avl5yefdQheeu15GxRqdBvrZt1IZpyHBrp5cZ9esUGXPibqk4Rb7D0_Z2xG95JKPN1MXcNtmfxtXTqK-m5pDP9MjxSffuHc_b5S_iqXl2tkVNqxIckwdZ-6Nnq3UDA',
    },
    {
      title: 'Live Ittar & Saffron Fragrance Bar',
      type: 'wedding' as const,
      category: 'Sensory Keepsake',
      description: 'Master Kannauj perfumer blending artisanal rose, vetiver, and jasmine essences into engraved crystal flacons customized with guest initials.',
      impact: 'Ultra-luxurious tactile memento embodying timeless regional hospitality.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS9yFn-98UnLScX5h01mQ_-TyDAndVHKAsY0RGEj-aQoFoIV9WmhIh59nIw6ZhvxFTZqZg5wvIVDWin43KKGTAjLv0lx8Rh7QWVl6JMzCfMpMdZo0nPnEesttjM79jldPStN-B-P8hU-pRBqB6yw7LgZwE1VDwo6Y7LLqNi89K3iU3B-q7r8Paf1K3zqb8L_vSEhQSO0evclvwiGT4tGoDr6qHkTEcJmnQiCgN33LfJRNbhhgXo6j2Lw',
    },
    {
      title: 'Acoustic Sufi Sundowner Under Marigold Canopies',
      type: 'wedding' as const,
      category: 'Live Music & Ambiance',
      description: 'Seated folk-Sufi ensemble playing semi-classical ghazals and qawwalis on silk gaddas during the twilight cocktail hour.',
      impact: 'Sets a soul-stirring, intimate mood before the high-energy reception.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjwbpYlPCWO2NQ80FXL_zDTeyXIDinVbGXzmvL3ZSp9JTFFjjpprdt4Y3LeBnfLyDJ_XrW3cQPEB9dEIezE6NUJAaVy-tMB7C4iqL_93ePbK3myo2lmn5QI8-n0I7TapbFi9W1nmWKBr9srWZOhnM96uCNK3iCd61k880IUp_iryYmiEIoE7qT3DIq0YEOe0YMO_zZuGbLaHRq4Azp4eqqRUooV_jahEDgbvFvP_39S3YvfKvv-AROdA',
    },

    // Birthdays
    {
      title: 'Interactive "Year in Flavor" Cocktail Tasting Flight',
      type: 'birthday' as const,
      category: 'Artisanal Bar Experience',
      description: 'Three crafted signature cocktails where each botanical elixir mirrors a milestone chapter or unforgettable trip in the celebrant’s life.',
      impact: 'Sparks storytelling and deeply personal connection among guests.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK3Pri2JjYTQoriXQeyW9VR1EyFt8CwAh4D6OoobsQjO54J83dM60IznrVWf5qC7_R5nKVmWs95xzECjgDWiEOlVWcftgHPx2Q9-fMmsxImGMb4aSohSmwZyy3Rg7wE6Ergpc5dNtr0RJ0D4m3XiV62HLkbjkU8hTyzZJJLF7_c-pZ31yqLyPesNWpOPyp-ScThshxnzR-dfdPof1g_OqiFTfEpOK3_SoqljIxURrtSg8CKkbaXVMUOQ',
    },
    {
      title: 'Vintage Rotary Audio Guestbook & Polaroid Wall',
      type: 'birthday' as const,
      category: 'Memory Keepsake',
      description: 'A restored 1970s rotary telephone where guests record voicemail toasts, coupled with an instant film camera station on copper mesh.',
      impact: 'Irreplaceable audio and visual keepsake that host treasures for decades.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS9yFn-98UnLScX5h01mQ_-TyDAndVHKAsY0RGEj-aQoFoIV9WmhIh59nIw6ZhvxFTZqZg5wvIVDWin43KKGTAjLv0lx8Rh7QWVl6JMzCfMpMdZo0nPnEesttjM79jldPStN-B-P8hU-pRBqB6yw7LgZwE1VDwo6Y7LLqNi89K3iU3B-q7r8Paf1K3zqb8L_vSEhQSO0evclvwiGT4tGoDr6qHkTEcJmnQiCgN33LfJRNbhhgXo6j2Lw',
    },
    {
      title: 'Sculptural 3-Tier Cake Unveiling & Cold Pyro Reveal',
      type: 'birthday' as const,
      category: 'Signature Highlight',
      description: 'Architectural lemon-raspberry confection wheeled onto the terrace under synchronized cold sparklers and a brass fanfare.',
      impact: 'The defining celebratory crescendo of the birthday soirée.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjwbpYlPCWO2NQ80FXL_zDTeyXIDinVbGXzmvL3ZSp9JTFFjjpprdt4Y3LeBnfLyDJ_XrW3cQPEB9dEIezE6NUJAaVy-tMB7C4iqL_93ePbK3myo2lmn5QI8-n0I7TapbFi9W1nmWKBr9srWZOhnM96uCNK3iCd61k880IUp_iryYmiEIoE7qT3DIq0YEOe0YMO_zZuGbLaHRq4Azp4eqqRUooV_jahEDgbvFvP_39S3YvfKvv-AROdA',
    },

    // Community Events
    {
      title: 'The Great Community Tasting Passport',
      type: 'community' as const,
      category: 'Interactive Culinary Walk',
      description: 'Attendees receive a stamped pocket booklet guiding them across 8 local cultural bakeries, food trucks, and regional street food stalls.',
      impact: 'Drives balanced foot traffic across all neighborhood food artisans.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK3Pri2JjYTQoriXQeyW9VR1EyFt8CwAh4D6OoobsQjO54J83dM60IznrVWf5qC7_R5nKVmWs95xzECjgDWiEOlVWcftgHPx2Q9-fMmsxImGMb4aSohSmwZyy3Rg7wE6Ergpc5dNtr0RJ0D4m3XiV62HLkbjkU8hTyzZJJLF7_c-pZ31yqLyPesNWpOPyp-ScThshxnzR-dfdPof1g_OqiFTfEpOK3_SoqljIxURrtSg8CKkbaXVMUOQ',
    },
    {
      title: 'Collaborative 24ft Neighborhood Mural Canvas',
      type: 'community' as const,
      category: 'Community Public Art',
      description: 'A primed timber mural where local children, youth, and senior citizens paint their favorite park memories under the guidance of a resident artist.',
      impact: 'Installed permanently in the community civic center post-festival.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhmcMKS77C9dL5wZYMnkJM_wtjHoi8LHz3yObEIDEfXSUNMNh3PCTI2SAgBOc_TGKgCzTxnr3h9l166C6dXiHHv8PMjEmembF5TJK7I86FJV2D5mXtf3qYAPi_Avl5yefdQheeu15GxRqdBvrZt1IZpyHBrp5cZ9esUGXPibqk4Rb7D0_Z2xG95JKPN1MXcNtmfxtXTqK-m5pDP9MjxSffuHc_b5S_iqXl2tkVNqxIckwdZ-6Nnq3UDA',
    },
    {
      title: 'Sunset Acoustic Showcase & Civic Volunteer Honors',
      type: 'community' as const,
      category: 'Stage & Recognition',
      description: 'Open-air amphitheater performances by youth orchestra followed by ceremonial medals awarded to neighborhood civic champions.',
      impact: 'Deepens community solidarity and local pride.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjwbpYlPCWO2NQ80FXL_zDTeyXIDinVbGXzmvL3ZSp9JTFFjjpprdt4Y3LeBnfLyDJ_XrW3cQPEB9dEIezE6NUJAaVy-tMB7C4iqL_93ePbK3myo2lmn5QI8-n0I7TapbFi9W1nmWKBr9srWZOhnM96uCNK3iCd61k880IUp_iryYmiEIoE7qT3DIq0YEOe0YMO_zZuGbLaHRq4Azp4eqqRUooV_jahEDgbvFvP_39S3YvfKvv-AROdA',
    },
  ];

  const palettes = [
    {
      name: 'Imperial Mewar Wedding',
      type: 'wedding',
      colors: ['#512C3D', '#FE9D7F', '#E8E1DC', '#BDCBAC'],
      description: 'Deep Royal Plum, Mewari Terracotta, Aged Champagne, and Eucalyptus Sage',
    },
    {
      name: 'Sunset Bohemian Birthday',
      type: 'birthday',
      colors: ['#FE9D7F', '#E8E1DC', '#F59E0B', '#512C3D'],
      description: 'Sunset Terracotta, Warm Champagne, Golden Marigold, and Midnight Plum',
    },
    {
      name: 'Green Harvest Community Commons',
      type: 'community',
      colors: ['#1A2510', '#D97706', '#BDCBAC', '#FFF8F4'],
      description: 'Forest Evergreen, Warm Ochre, Eucalyptus Sage, and Sunlit Canvas',
    },
  ];

  const filteredIdeas = [...generatedIdeas, ...baseIdeas].filter((i) => {
    if (activeCategory === 'all') return true;
    return i.type === activeCategory;
  });

  const handleGenerateCustomIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdeaInput.trim()) return;

    const newIdea = {
      title: `Personalized Concept: "${customIdeaInput}"`,
      type: activeCategory === 'all' ? 'wedding' : activeCategory,
      category: 'Bespoke AI Synthesis',
      description: `Tailored sensory ambiance curated around "${customIdeaInput}", featuring custom lighting temperatures, curated guest interactions, and artisanal touchpoints.`,
      impact: 'Elevates guest delight and transforms ordinary moments into signature memories.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjwbpYlPCWO2NQ80FXL_zDTeyXIDinVbGXzmvL3ZSp9JTFFjjpprdt4Y3LeBnfLyDJ_XrW3cQPEB9dEIezE6NUJAaVy-tMB7C4iqL_93ePbK3myo2lmn5QI8-n0I7TapbFi9W1nmWKBr9srWZOhnM96uCNK3iCd61k880IUp_iryYmiEIoE7qT3DIq0YEOe0YMO_zZuGbLaHRq4Azp4eqqRUooV_jahEDgbvFvP_39S3YvfKvv-AROdA',
    };

    setGeneratedIdeas([newIdea, ...generatedIdeas]);
    setCustomIdeaInput('');
  };

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-4">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs text-secondary font-label-sm uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Atelier Moodboard &amp; Sensory Archive</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Ideas &amp; Inspiration</h1>
            <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
              Curated creative concepts, signature moments, and atmospheric color harmonies for Weddings, Birthdays, and Community Events.
            </p>
          </div>

          {/* Domain Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Celebrations
            </button>
            <button
              onClick={() => setActiveCategory('wedding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'wedding'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>💍</span> Weddings
            </button>
            <button
              onClick={() => setActiveCategory('birthday')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'birthday'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🎂</span> Birthdays
            </button>
            <button
              onClick={() => setActiveCategory('community')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeCategory === 'community'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>🎪</span> Community
            </button>
          </div>
        </div>

        {/* Interactive GenAI Idea Spark Prompt */}
        <div className="p-space-md rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <form onSubmit={handleGenerateCustomIdea} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined text-secondary absolute left-3 top-3 text-[18px]">
                auto_awesome
              </span>
              <input
                type="text"
                value={customIdeaInput}
                onChange={(e) => setCustomIdeaInput(e.target.value)}
                placeholder="Ask GenAI for ideas (e.g. 'Cozy autumnal tea party for 40' or 'Silent disco under starry canopy')..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
              />
            </div>
            <button
              type="submit"
              disabled={!customIdeaInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              Generate Idea
            </button>
          </form>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {filteredIdeas.map((idea, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm border border-outline-variant/30 group flex flex-col justify-between"
            >
              <div>
                <div className="h-52 overflow-hidden relative">
                  <img
                    src={idea.image}
                    alt={idea.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent p-4 flex items-end text-white">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed">
                        {idea.category}
                      </span>
                      <h4 className="font-title-md font-bold mt-1 text-white leading-tight">{idea.title}</h4>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-on-surface-variant leading-relaxed">{idea.description}</p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-1.5 text-xs text-tertiary font-medium">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                  <span>{idea.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Color Story Swatches by Event Domain */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-primary">Harmonic Color Harmonies by Event Type</h3>
            <span className="text-xs text-outline">Tailored Swatches</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {palettes.map((pal, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-container-low space-y-2 border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-title-md font-bold text-primary">{pal.name}</h4>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-outline">
                    {pal.type}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-12 rounded-lg overflow-hidden shadow-inner">
                  {pal.colors.map((c, i) => (
                    <div key={i} style={{ backgroundColor: c }} title={c}></div>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant">{pal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
