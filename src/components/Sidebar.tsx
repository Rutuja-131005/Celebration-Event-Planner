import React from 'react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCreateEventClick: () => void;
  activeEventsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onCreateEventClick,
  activeEventsCount = 5,
}) => {
  const navItems = [
    { path: 'overview', label: 'Overview', icon: 'dashboard' },
    {
      path: 'ai-planning-studio',
      label: 'AI Master Blueprint',
      icon: 'auto_awesome',
      iconClass: 'text-secondary',
    },
    { path: 'budget-and-forecast', label: 'Budget & Forecast', icon: 'payments' },
    { path: 'timeline-and-tasks', label: 'Timeline & Tasks', icon: 'checklist' },
    { path: 'vendors-and-quotations', label: 'Vendors & Quotes', icon: 'storefront' },
    { path: 'my-events', label: 'My Celebrations', icon: 'celebration' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white z-50 flex flex-col justify-between border-r border-stone-200/70">
      <div className="flex flex-col">
        {/* Minimal Brand header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('overview')}>
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-serif font-bold tracking-wider shadow-xs">
              CA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base text-stone-900 tracking-tight font-semibold truncate leading-tight">
                Celebration Atelier
              </span>
              <span className="text-[10px] text-stone-400 font-medium tracking-wider uppercase truncate">
                Event Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-4 mb-3">
          <button
            onClick={onCreateEventClick}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold py-2.5 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.99] border border-stone-800"
            type="button"
          >
            <span className="material-symbols-outlined text-[17px] text-amber-300">auto_awesome</span>
            <span>New Celebration</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav aria-label="Main Navigation" className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                  isActive
                    ? 'bg-stone-100 text-stone-950 font-semibold'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
                type="button"
              >
                <span className={`material-symbols-outlined text-[19px] ${isActive ? 'text-stone-900' : 'text-stone-400'}`} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom plan status card */}
      <div className="p-3 mx-3 mb-4 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-stone-800">
              {activeEventsCount} Active Celebrations
            </span>
            <span className="text-[11px] text-stone-400">Atelier Suite</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="text-stone-400 hover:text-stone-800 transition-colors cursor-pointer p-1"
          title="Atelier Settings"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">settings</span>
        </button>
      </div>
    </aside>
  );
};
