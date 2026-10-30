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
  onCreateEventClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  activeEvent,
  allEvents,
  onSelectEvent,
  currentUser,
  onNavigate,
  onOpenAuth,
  onCreateEventClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const formatPathName = (path: string) => {
    switch (path) {
      case 'overview':
        return 'Celebration Overview';
      case 'ai-planning-studio':
        return 'AI Master Blueprint';
      case 'budget-and-forecast':
        return 'Budget & Forecasting';
      case 'timeline-and-tasks':
        return 'Timeline & Milestones';
      case 'vendors-and-quotations':
        return 'Vendors & Quotations';
      case 'my-events':
        return 'My Celebrations';
      case 'settings':
        return 'Atelier Settings';
      default:
        return 'Celebration Planner';
    }
  };

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-white/95 backdrop-blur-md z-40 flex items-center justify-between px-7 border-b border-stone-200/70">
      {/* Left section: Clean Page Title & Active Event Switcher */}
      <div className="flex items-center gap-4 min-w-0">
        <h2 className="font-serif text-lg text-stone-900 font-semibold tracking-tight truncate hidden md:block">
          {formatPathName(currentPath)}
        </h2>

        <span className="hidden md:inline text-stone-300 font-light">/</span>

        {/* Active Event Pill Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 bg-stone-50 px-3.5 py-1.5 rounded-xl cursor-pointer hover:bg-stone-100 transition-all text-left border border-stone-200/80 shadow-2xs"
            type="button"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-900 font-medium truncate max-w-[200px] lg:max-w-xs leading-tight">
                {activeEvent ? activeEvent.name : 'Select Celebration'}
              </span>
              {activeEvent && (
                <span className="text-[10px] text-stone-400 truncate leading-none mt-0.5">
                  {activeEvent.location} · ₹{(activeEvent.budgetAmount / 100000).toFixed(1)}L
                </span>
              )}
            </div>
            <span className="material-symbols-outlined text-[16px] text-stone-400 ml-1">expand_more</span>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-stone-200/80 py-2 z-50">
              <div className="px-3.5 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                <span>Active Celebrations</span>
                <span className="text-[11px] text-stone-500 font-normal">{allEvents.length} total</span>
              </div>
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
                {allEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      onSelectEvent(ev.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-stone-50 transition-colors cursor-pointer ${
                      activeEvent?.id === ev.id ? 'bg-stone-100 font-semibold' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-stone-500 text-[18px] shrink-0 mt-0.5">
                      castle
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-stone-900 truncate leading-snug font-medium">
                        {ev.name}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center justify-between mt-0.5">
                        <span className="truncate">{ev.location}</span>
                        <span className="font-semibold text-stone-700">₹{(ev.budgetAmount / 100000).toFixed(1)}L</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {onCreateEventClick && (
                <div className="p-2 border-t border-stone-100 mt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onCreateEventClick();
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Create New Celebration</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right controls: Quick Creation CTA & Profile */}
      <div className="flex items-center gap-4">
        {onCreateEventClick && (
          <button
            onClick={onCreateEventClick}
            className="hidden sm:flex items-center gap-1.5 bg-stone-900 hover:bg-black text-white text-xs px-3.5 py-1.5 rounded-xl font-medium shadow-2xs transition-all cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-300">auto_awesome</span>
            <span>New Celebration</span>
          </button>
        )}

        {/* User profile with dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-space-sm cursor-pointer group"
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
