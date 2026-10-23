import React, { useState } from 'react';
import { Event, User } from '../../server/models/types.ts';

interface HeaderProps {
  currentPath: string;
  activeEvent: Event | null;
  allEvents: Event[];
  onSelectEvent: (eventId: string) => void;
  currentUser: User | null;
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  activeEvent,
  allEvents,
  onSelectEvent,
  currentUser,
  onNavigate,
  onOpenAuth,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const formatPathName = (path: string) => {
    switch (path) {
      case 'overview':
        return 'Overview';
      case 'my-events':
        return 'My Events';
      case 'ai-planning-studio':
        return 'AI Planning Studio';
      case 'budget-and-forecast':
        return 'Budget & Forecast';
      case 'timeline-and-tasks':
        return 'Timeline & Tasks';
      case 'vendors-and-quotations':
        return 'Vendors & Quotations';
      case 'ideas-and-inspiration':
        return 'Ideas & Inspiration';
      case 'reports-and-insights':
        return 'Reports & Insights';
      case 'settings':
        return 'Settings';
      default:
        return 'Atelier Studio';
    }
  };

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg border-b border-outline-variant/30">
      {/* Left breadcrumb and event selector */}
      <div className="flex items-center gap-space-md min-w-0">
        <div className="hidden sm:flex items-center gap-space-xs text-outline font-body-sm text-body-sm">
          <span
            onClick={() => onNavigate('overview')}
            className="hover:text-on-surface transition-colors cursor-pointer"
          >
            {formatPathName(currentPath)}
          </span>
          <span>/</span>
          <span className="text-on-surface font-title-md text-title-md truncate max-w-[200px]">
            Spring & Autumn Celebrations
          </span>
        </div>

        {/* Active Event Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors text-left"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">celebration</span>
            <span className="font-label-md text-label-md text-on-surface font-medium truncate max-w-[220px] md:max-w-xs">
              {activeEvent ? `${activeEvent.name} · ₹${(activeEvent.budgetAmount / 100000).toFixed(1)}L Budget` : 'Select Celebration'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/40 py-1.5 z-50">
              <div className="px-3 py-1.5 text-xs font-semibold text-outline uppercase tracking-wider">
                Switch Active Celebration
              </div>
              <div className="divide-y divide-outline-variant/20 max-h-60 overflow-y-auto">
                {allEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      onSelectEvent(ev.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-surface-container-low transition-colors cursor-pointer ${
                      activeEvent?.id === ev.id ? 'bg-primary-fixed/30 font-semibold' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                      castle
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-title-md text-title-md text-primary truncate leading-snug">
                        {ev.name}
                      </div>
                      <div className="font-body-sm text-body-sm text-outline flex items-center justify-between">
                        <span>{ev.location}</span>
                        <span>₹{(ev.budgetAmount / 100000).toFixed(1)}L</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right dock controls */}
      <div className="flex items-center gap-space-sm">
        {/* Search Input */}
        <div className="hidden md:flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-xl text-outline gap-space-sm w-44 hover:bg-surface-container transition-colors cursor-text">
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span className="font-body-sm text-body-sm flex-1">Search</span>
          <kbd className="font-label-sm text-label-sm bg-surface px-1.5 py-0.5 rounded shadow-sm text-outline">
            ⌘K
          </kbd>
        </div>

        {/* Ask Studio AI action */}
        <button
          onClick={() => onNavigate('ai-planning-studio')}
          className="flex items-center gap-1 bg-secondary text-on-secondary px-space-sm py-1.5 rounded-xl font-label-md text-label-md shadow-sm hover:bg-on-secondary-container transition-all cursor-pointer active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span className="hidden lg:inline">Ask Studio AI</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => onNavigate('overview')}
          className="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-xl transition-all cursor-pointer"
          title="Milestone Notifications"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary"></span>
        </button>

        {/* User profile with dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-space-sm pl-space-xs cursor-pointer group"
            type="button"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant group-hover:ring-primary transition-all"
              src={
                currentUser?.avatarUrl ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuD86wFMv7GznXchX3b4O0dO0Rfez-G3ls1BbhsDJ0csLCul8V7slfahg9diMslJ1IoVgS44Ez3ew_HFxaRBsRsXAra2Tfahx2dEi1psEBko4A9GOcglUSNHJkeWtIhe90bEwS4Pd0HEFlR_MQ6jWaLs6Tmg8gYFOpdYpoTVe6UTJ3SPEB_cF_LAzhIkZA1B4eeLHhgwBJ0G9JGPfwa3g7bfhVB94BhsEVkIMxGpgrMstBUC8ijg7jOxDw'
              }
            />
            <div className="hidden xl:flex flex-col min-w-0 text-left">
              <span className="font-label-md text-label-md font-semibold text-on-surface truncate leading-tight">
                {currentUser?.name || 'Priya Sharma'}
              </span>
              <span className="font-label-sm text-label-sm text-outline truncate leading-tight">
                {currentUser?.role || 'Lead Planner'}
              </span>
            </div>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant/40 py-2 z-50">
              <div className="px-3 py-1.5 border-b border-outline-variant/20 mb-1">
                <p className="font-title-md text-title-md text-primary leading-tight">
                  {currentUser?.name || 'Priya Sharma'}
                </p>
                <p className="font-body-sm text-body-sm text-outline">{currentUser?.email || 'priya@atelier.com'}</p>
              </div>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setUserDropdownOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">settings</span>
                <span>Atelier Settings</span>
              </button>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  onOpenAuth();
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-secondary hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                <span>Switch / Auth Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
