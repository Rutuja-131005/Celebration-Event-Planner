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
    { path: 'my-events', label: 'My Events', icon: 'calendar_today' },
    {
      path: 'ai-planning-studio',
      label: 'AI Planning Studio',
      icon: 'auto_awesome',
      iconClass: 'text-secondary',
    },
    { path: 'budget-and-forecast', label: 'Budget & Forecast', icon: 'payments' },
    { path: 'timeline-and-tasks', label: 'Timeline & Tasks', icon: 'checklist' },
    { path: 'vendors-and-quotations', label: 'Vendors & Quotations', icon: 'storefront' },
    { path: 'ideas-and-inspiration', label: 'Ideas & Inspiration', icon: 'palette' },
    { path: 'reports-and-insights', label: 'Reports & Insights', icon: 'analytics' },
    { path: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-r border-outline-variant/30">
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="px-space-lg pt-space-lg pb-space-md">
          <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => onNavigate('overview')}>
            <img
              alt="Celebration & Event Planner Emblem"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRp4BItET0O8rwqrjgZug3vYLlId1PDSKc16HbLiwkz93dJnGWEvcrL7Ow1BkVDIE191MIesFBJqarjbsMVjoZQHt6fq099eO0z-XTo6ysahmstaHa4XH3xvG29P1enGj8dGOy0s_zmXlN7TfNAlM1z5pOA7U2mwXwVEBLPPlowhrbjcCkuhOfSz7Jo80X24uKF6-4YyTRY3Xjg6s3eyyjdHpW1UOndWufOI8rwZNocA_A-7KYEqiJ2Q"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight truncate leading-tight">
                Celebration
              </span>
              <span className="font-label-sm text-label-sm text-outline tracking-wider uppercase truncate">
                & Event Planner
              </span>
            </div>
          </div>
          <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant italic truncate">
            Every detail, thoughtfully planned
          </p>
        </div>

        {/* Action Button */}
        <div className="px-space-md mb-space-sm">
          <button
            onClick={onCreateEventClick}
            className="w-full flex items-center justify-center gap-space-sm bg-primary-container hover:bg-primary text-on-primary font-title-md text-title-md py-space-sm px-space-md rounded-xl shadow-[0_4px_12px_-2px_rgba(81,44,61,0.15)] transition-all cursor-pointer active:scale-[0.99]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Event</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="px-space-sm space-y-0.5 overflow-y-auto max-h-[calc(100vh-270px)]">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed font-title-md shadow-[0_2px_8px_rgba(81,44,61,0.06)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
                type="button"
              >
                <span className={`material-symbols-outlined text-[20px] ${item.iconClass || ''}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom plan status card */}
      <div className="p-space-md m-space-sm rounded-xl bg-surface-container flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-space-sm">
          <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-semibold text-on-surface">
              {activeEventsCount} Active Celebrations
            </span>
            <span className="font-body-sm text-body-sm text-outline">Atelier Plan</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="text-outline hover:text-primary transition-colors cursor-pointer"
          title="Atelier Help & Status"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
        </button>
      </div>
    </aside>
  );
};
