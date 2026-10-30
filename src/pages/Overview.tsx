import React, { useState } from 'react';
import { Event, Task, VendorQuote, Prediction } from '../../server/models/types.ts';
import { tasksService } from '../services/tasks.ts';

interface OverviewProps {
  event: Event;
  tasks: Task[];
  quotes: VendorQuote[];
  prediction: Prediction | null;
  onNavigate: (path: string) => void;
  onOpenAddTask: () => void;
  onRefreshData: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  event,
  tasks,
  quotes,
  prediction,
  onNavigate,
  onOpenAddTask,
  onRefreshData,
}) => {
  const [taskFilter, setTaskFilter] = useState<'all' | 'high'>('all');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [showRadarTable, setShowRadarTable] = useState(false);

  const handleToggleTask = async (task: Task) => {
    try {
      setUpdatingTaskId(task.id);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await tasksService.updateTask(task.id, { status: newStatus });
      onRefreshData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'high') return t.priority === 'high';
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = 62; // 62 milestones standard
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full">
        {/* Top Greeting & Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs text-secondary font-label-sm uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Atelier Daily Portfolio · Udaipur Heritage Season</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Good morning, Priya.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Here is the atelier overview for your flagship celebration. Milestones are trending smoothly with 4 critical approvals scheduled for this week.
            </p>
          </div>

          {/* Right Quick Actions & Event Pill */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-full shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-title-md text-title-md text-primary truncate max-w-[240px]">
                {event.name}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                In {event.daysRemaining} Days
              </span>
              <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                {event.readinessScore}% Ready
              </span>
            </div>
            <button
              onClick={() => onNavigate('reports-and-insights')}
              className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-title-md py-space-sm px-space-md rounded-xl transition-all shadow-sm cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export</span>
            </button>
            <button
              onClick={() => onNavigate('ai-planning-studio')}
              className="flex items-center gap-space-xs bg-secondary hover:bg-on-secondary-container text-on-secondary font-title-md text-title-md py-space-sm px-space-md rounded-xl shadow-sm transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>Ask Studio AI</span>
            </button>
          </div>
        </div>

        {/* Key Financial & Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
          {/* Card 1: Target Baseline */}
          <div
            onClick={() => onNavigate('budget-and-forecast')}
            className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Planned Budget
              </span>
              <span className="material-symbols-outlined text-[20px] text-outline">account_balance_wallet</span>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight mb-space-xs">
              ₹25,00,000
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Target Baseline Cap</span>
              <span className="text-outline font-label-sm text-label-sm">Udaipur Destination</span>
            </div>
            <div className="mt-space-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full w-full"></div>
            </div>
          </div>

          {/* Card 2: AI Projected */}
          <div
            onClick={() => onNavigate('budget-and-forecast')}
            className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Estimated Cost
              </span>
              <span className="flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                <span className="material-symbols-outlined text-[14px]">trending_down</span>
                -₹85,000
              </span>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight mb-space-xs">
              ₹24,15,000
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>AI Projected Total</span>
              <span className="text-tertiary font-label-sm text-label-sm font-semibold">3.4% Under budget</span>
            </div>
            <div className="mt-space-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-container rounded-full w-[96.6%]"></div>
            </div>
          </div>

          {/* Card 3: Actual Spent / Committed */}
          <div
            onClick={() => onNavigate('budget-and-forecast')}
            className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Committed &amp; Disbursed
              </span>
              <span className="font-label-sm text-label-sm font-semibold text-secondary">67% Paid</span>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight mb-space-xs">
              ₹16,80,000
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>Next tranche: ₹3.2L in 10d</span>
              <span className="text-outline font-label-sm text-label-sm">8 of 12 milestones</span>
            </div>
            <div className="mt-space-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary-container rounded-full w-[67.2%] transition-all duration-700"></div>
            </div>
          </div>

          {/* Card 4: Tasks & Milestones */}
          <div
            onClick={() => onNavigate('timeline-and-tasks')}
            className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Milestones Completed
              </span>
              <span className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium">
                4 Due Soon
              </span>
            </div>
            <div className="font-headline-md text-headline-md text-primary tracking-tight mb-space-xs">
              {completedCount} <span className="font-title-lg text-title-lg text-outline font-normal">/ {totalCount}</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
              <span>{completionPercentage}% overall completion</span>
              <span className="text-secondary font-label-sm text-label-sm font-semibold">On Schedule</span>
            </div>
            <div className="mt-space-md h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Hero Event Spotlight Bento Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
          {/* Left: Showcase Dossier (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-surface-container-high opacity-40 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
                <div className="flex items-center gap-space-xs bg-surface-container px-3 py-1 rounded-full text-secondary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  <span>Flagship Celebration · Jagmandir Island Palace</span>
                </div>
                <span className="text-outline font-label-sm text-label-sm font-medium tracking-wide">
                  ID: {event.code || 'ATELIER-2025-UDR'}
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-space-xs">
                {event.name}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mb-space-lg">
                A bespoke 3-day imperial celebration orchestrating timeless Mewari architecture, royal lakeside courtyards, and curated artisan gastronomy across Lake Pichola.
              </p>

              {/* Attribute Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm py-space-md bg-surface-container-low rounded-xl px-space-md mb-space-lg">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block">Event Date</span>
                  <span className="font-title-md text-title-md text-on-surface">14 Dec 2025</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block">Guest List</span>
                  <span className="font-title-md text-title-md text-on-surface">320 Invites</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block">RSVP Verified</span>
                  <span className="font-title-md text-title-md text-tertiary">285 Confirmed</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline block">Pending RSVP</span>
                  <span className="font-title-md text-title-md text-secondary">35 Awaiting</span>
                </div>
              </div>
            </div>

            {/* Footer Tags & Moodboard link */}
            <div className="relative z-10 pt-space-sm flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-outline">Theme &amp; Tone:</span>
                <span className="bg-surface-container-high px-2.5 py-1 rounded-md font-label-sm text-label-sm text-primary font-medium">
                  Royal Marwar &amp; Rajputana Florals
                </span>
                <span className="bg-surface-container-high px-2.5 py-1 rounded-md font-label-sm text-label-sm text-primary font-medium">
                  Lakeside Candlelight
                </span>
              </div>
              <button
                onClick={() => onNavigate('ai-planning-studio')}
                className="text-secondary hover:text-primary transition-colors font-title-md text-title-md flex items-center gap-1 group cursor-pointer"
                type="button"
              >
                <span>Open Full Dossier</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* Right: Operational Readiness & Sector Progress (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="space-y-0.5">
                  <h3 className="font-title-lg text-title-lg text-primary">Readiness Radar</h3>
                  <p className="font-body-sm text-body-sm text-outline">Functional pillars for wedding weekend</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRadarTable(!showRadarTable)}
                    aria-expanded={showRadarTable}
                    aria-controls="readiness-radar-table"
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1 bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      {showRadarTable ? 'donut_large' : 'table_chart'}
                    </span>
                    <span>{showRadarTable ? 'View Rings' : 'View Table'}</span>
                  </button>
                  <span className="bg-surface-container px-space-sm py-1 rounded-lg font-label-sm text-label-sm text-on-surface-variant font-semibold">
                    All Venues Locked
                  </span>
                </div>
              </div>

              {/* Accessible Sr-Only / Visible Data Table */}
              {showRadarTable ? (
                <div id="readiness-radar-table" className="overflow-x-auto">
                  <table className="w-full text-left text-sm divide-y divide-outline-variant/30">
                    <caption className="sr-only">Readiness Radar Functional Pillar Scores</caption>
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-outline font-semibold">
                        <th scope="col" className="py-2">Pillar</th>
                        <th scope="col" className="py-2">Operational Details</th>
                        <th scope="col" className="py-2 text-right">Completion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      <tr>
                        <td className="py-2.5 font-medium text-on-surface">Palace &amp; Courtyard Venues</td>
                        <td className="py-2.5 text-on-surface-variant text-xs">Jagmandir, Zenana Mahal, Poolside Lawns</td>
                        <td className="py-2.5 text-right font-bold text-tertiary">100%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium text-on-surface">Catering &amp; Beverage Menus</td>
                        <td className="py-2.5 text-on-surface-variant text-xs">Rajputana feasts · Final tasting passed</td>
                        <td className="py-2.5 text-right font-bold text-primary">90%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium text-on-surface">Decor &amp; 3D Scenography</td>
                        <td className="py-2.5 text-on-surface-variant text-xs">Mandap renders approved; Florals in check</td>
                        <td className="py-2.5 text-right font-bold text-secondary">85%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-medium text-on-surface">Boats, Shuttles &amp; Concierge</td>
                        <td className="py-2.5 text-on-surface-variant text-xs">Jetty slips contracted; Airport shuttles open</td>
                        <td className="py-2.5 text-right font-bold text-on-surface-variant">60%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Pillar items with SVG Progress Rings */
                <div className="space-y-space-md" role="region" aria-label="Readiness radar progress rings">
                  {/* Screen reader summary table */}
                  <div className="sr-only">
                    <table>
                      <caption>Operational Readiness Progress Summary</caption>
                      <thead>
                        <tr><th scope="col">Functional Pillar</th><th scope="col">Status</th></tr>
                      </thead>
                      <tbody>
                        <tr><td>Palace &amp; Courtyard Venues</td><td>100% Locked</td></tr>
                        <tr><td>Catering &amp; Beverage Menus</td><td>90% Final Tasting Passed</td></tr>
                        <tr><td>Decor &amp; 3D Scenography</td><td>85% Mandap Renders Approved</td></tr>
                        <tr><td>Boats, Shuttles &amp; Concierge</td><td>60% Jetty Slips Contracted</td></tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Item 1: Venue */}
                  <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm" aria-hidden="true">
                        <span className="material-symbols-outlined text-[20px]">villa</span>
                      </div>
                      <div>
                        <h4 className="font-title-md text-title-md text-on-surface leading-snug">Palace &amp; Courtyard Venues</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Jagmandir, Zenana Mahal, Poolside Lawns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm font-semibold text-tertiary">100%</span>
                      <svg
                        role="img"
                        aria-label="Venue readiness: 100% complete"
                        className="w-8 h-8 -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                        <path className="text-tertiary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                      </svg>
                    </div>
                  </div>

                  {/* Item 2: Catering & Banquets */}
                  <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm" aria-hidden="true">
                        <span className="material-symbols-outlined text-[20px]">restaurant</span>
                      </div>
                      <div>
                        <h4 className="font-title-md text-title-md text-on-surface leading-snug">Catering &amp; Beverage Menus</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Rajputana feasts · Final tasting passed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm font-semibold text-primary">90%</span>
                      <svg
                        role="img"
                        aria-label="Catering readiness: 90% complete"
                        className="w-8 h-8 -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                        <path className="text-primary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="90, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                      </svg>
                    </div>
                  </div>

                  {/* Item 3: Decor & Visual Scenography */}
                  <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary-container shadow-sm" aria-hidden="true">
                        <span className="material-symbols-outlined text-[20px]">palette</span>
                      </div>
                      <div>
                        <h4 className="font-title-md text-title-md text-on-surface leading-snug">Decor &amp; 3D Scenography</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Mandap renders approved; Florals in check</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm font-semibold text-secondary">85%</span>
                      <svg
                        role="img"
                        aria-label="Decor readiness: 85% complete"
                        className="w-8 h-8 -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                        <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="85, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                      </svg>
                    </div>
                  </div>

                  {/* Item 4: Guest Logistics & Transfers */}
                  <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-outline shadow-sm" aria-hidden="true">
                        <span className="material-symbols-outlined text-[20px]">directions_boat</span>
                      </div>
                      <div>
                        <h4 className="font-title-md text-title-md text-on-surface leading-snug">Boats, Shuttles &amp; Concierge</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Jetty slips contracted; Airport shuttles open</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant">60%</span>
                      <svg
                        role="img"
                        aria-label="Logistics readiness: 60% complete"
                        className="w-8 h-8 -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                        <path className="text-outline" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="60, 100" strokeLinecap="round" strokeWidth="3.5"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-space-md flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-outline">Next Review: Today, 4:00 PM</span>
              <button
                onClick={() => onNavigate('timeline-and-tasks')}
                className="text-primary hover:text-secondary font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                type="button"
              >
                View Master Timeline →
              </button>
            </div>
          </div>
        </div>

        {/* Mid-Section Grid: Action Queue (Priority Tasks) & Predictive Risk Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
          {/* Next Steps Priority Queue (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <h3 className="font-title-lg text-title-lg text-primary">Your Next Steps</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Immediate operational priorities requiring sign-off
                </p>
              </div>
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                    taskFilter === 'all'
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                  type="button"
                >
                  All Tasks
                </button>
                <button
                  onClick={() => setTaskFilter('high')}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-all cursor-pointer ${
                    taskFilter === 'high'
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-semibold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                  type="button"
                >
                  High Urgency
                </button>
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-space-sm" id="priority-task-queue">
              {filteredTasks.slice(0, 4).map((task) => {
                const isChecked = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-space-md bg-surface-container-low hover:bg-surface-container rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm group ${
                      isChecked ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-space-sm min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={updatingTaskId === task.id}
                        onChange={() => handleToggleTask(task)}
                        className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-title-md text-title-md text-primary leading-tight ${isChecked ? 'line-through text-outline' : ''}`}>
                            {task.title}
                          </span>
                          <span
                            className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full font-medium ${
                              task.priority === 'high'
                                ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {task.dueLabel}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs self-end sm:self-center shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold ${
                          task.priority === 'high'
                            ? 'bg-secondary text-on-secondary'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {task.priority === 'high' ? 'High Priority' : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <button
                        onClick={() => onNavigate('timeline-and-tasks')}
                        className="p-1 text-outline hover:text-primary transition-colors cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-space-md pt-space-sm flex items-center justify-between border-t border-outline-variant/20">
              <button
                onClick={onOpenAddTask}
                className="flex items-center gap-1 text-primary hover:text-secondary font-label-md text-label-md font-semibold transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Add Custom Milestone Task</span>
              </button>
              <span className="font-body-sm text-body-sm text-outline">
                Showing {Math.min(filteredTasks.length, 4)} of {tasks.length} upcoming tasks
              </span>
            </div>
          </div>

          {/* Predictive Planning Insights & Risk Radar (5 Cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[22px]">auto_awesome</span>
                  <div>
                    <h3 className="font-title-lg text-title-lg text-primary">Predictive Risk Radar</h3>
                    <p className="font-body-sm text-body-sm text-outline">Computational forecasting &amp; market telemetry</p>
                  </div>
                </div>
                <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full font-semibold">
                  Realtime
                </span>
              </div>

              <div className="space-y-space-md">
                {/* Insight Card 1 (Attendance Projection) */}
                <div className="bg-surface-container-low p-space-md rounded-xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-semibold">
                        Guest Attendance Projection
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">High Confidence</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-space-xs">
                    <strong>91% expected turnout</strong> based on velocity of confirmations and regional flight booking records into Maharana Pratap Airport.
                  </p>
                  <div className="p-space-xs bg-surface-container rounded-lg text-tertiary font-body-sm text-body-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                    <span>Recommendation: Set catering buffer to +25 plates instead of +40 to save approx. ₹42,000.</span>
                  </div>
                </div>

                {/* Insight Card 2 (Logistics Pressure Alert) */}
                <div className="bg-surface-container-low p-space-md rounded-xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-space-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                        Logistics Pressure Alert
                      </span>
                    </div>
                    <span className="bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm px-2 py-0.2 rounded-full font-semibold">
                      Caution
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-space-xs">
                    Peak winter tourist season in Udaipur creates potential <strong>15–20% surge rate</strong> on luxury passenger vans and lakeside motor boats.
                  </p>
                  <div className="p-space-xs bg-surface-container rounded-lg text-secondary font-body-sm text-body-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">priority_high</span>
                    <span>Action: Lock local transport vendor agreement before Nov 15 to secure baseline tier.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md">
              <p className="font-body-sm text-body-sm text-outline italic">
                Predictions calibrated from regional event logs, seasonal pricing models, and vendor milestone completions across Rajasthan.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Visual Section: Recent Vendor Stream & Curated Palette Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Vendor Activity & Quotation Stream (8 Cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div>
                <h3 className="font-title-lg text-title-lg text-primary">Vendor Quotations &amp; Engagements</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Active contracts, deposits, and verification statuses</p>
              </div>
              <button
                onClick={() => onNavigate('vendors-and-quotations')}
                className="text-secondary hover:text-primary font-title-md text-title-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Manage All Vendors</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
            </div>

            {/* Table / Record Stream */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider rounded-lg">
                    <th className="py-space-sm px-space-md rounded-l-lg font-semibold">Vendor Partner</th>
                    <th className="py-space-sm px-space-md font-semibold">Category</th>
                    <th className="py-space-sm px-space-md font-semibold">Contract Value</th>
                    <th className="py-space-sm px-space-md font-semibold">Status</th>
                    <th className="py-space-sm px-space-md rounded-r-lg text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 text-on-surface font-body-md text-body-md">
                  {quotes.slice(0, 3).map((quote) => {
                    const initials = quote.vendorName
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase();

                    const isApproved = quote.bookingStatus === 'approved';
                    const isSigned = quote.bookingStatus === 'contract_signed';

                    return (
                      <tr key={quote.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-space-sm px-space-md">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-label-sm">
                              {initials}
                            </div>
                            <div>
                              <span className="font-title-md text-title-md text-primary block leading-tight">
                                {quote.vendorName}
                              </span>
                              <span className="font-body-sm text-body-sm text-outline">
                                Valid until: {quote.validUntil}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-space-sm px-space-md text-on-surface-variant">{quote.category}</td>
                        <td className="py-space-sm px-space-md font-title-md text-title-md text-primary">
                          ₹{quote.quotedAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-space-sm px-space-md">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${
                              isApproved || isSigned
                                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isApproved || isSigned ? 'bg-tertiary' : 'bg-secondary'
                              }`}
                            ></span>
                            {isApproved ? 'Approved' : isSigned ? 'Contract Signed' : 'Deposit Pending'}
                          </span>
                        </td>
                        <td className="py-space-sm px-space-md text-right">
                          <button
                            onClick={() => onNavigate('vendors-and-quotations')}
                            className="text-outline hover:text-primary p-1 transition-colors cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Visual Inspiration & Venue Snapshot (4 Cols) */}
          <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <h3 className="font-title-lg text-title-lg text-primary">Venue Visual Mood</h3>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">Jagmandir Island</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Live moodboard anchor for evening lighting setup and mandap floral styling.
              </p>

              {/* Image Tile */}
              <div className="relative rounded-xl overflow-hidden shadow-sm group">
                <img
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Jagmandir Island Palace Udaipur at sunset"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjwbpYlPCWO2NQ80FXL_zDTeyXIDinVbGXzmvL3ZSp9JTFFjjpprdt4Y3LeBnfLyDJ_XrW3cQPEB9dEIezE6NUJAaVy-tMB7C4iqL_93ePbK3myo2lmn5QI8-n0I7TapbFi9W1nmWKBr9srWZOhnM96uCNK3iCd61k880IUp_iryYmiEIoE7qT3DIq0YEOe0YMO_zZuGbLaHRq4Azp4eqqRUooV_jahEDgbvFvP_39S3YvfKvv-AROdA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider block opacity-90">
                      Courtyard Illumination
                    </span>
                    <span className="font-title-md text-title-md">Lake Pichola Sunset</span>
                  </div>
                  <span className="bg-surface-container-lowest/20 backdrop-blur-md px-2 py-1 rounded text-label-sm">
                    Day 2
                  </span>
                </div>
              </div>

              {/* Palette Swatches */}
              <div className="mt-space-md">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider block mb-space-xs font-semibold">
                  Assigned Atelier Palette
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-full h-7 rounded-lg bg-primary-container shadow-xs"></div>
                    <span className="font-label-sm text-label-sm text-outline mt-1 truncate">Plum</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-7 rounded-lg bg-secondary shadow-xs"></div>
                    <span className="font-label-sm text-label-sm text-outline mt-1 truncate">Terracotta</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-7 rounded-lg bg-tertiary shadow-xs"></div>
                    <span className="font-label-sm text-label-sm text-outline mt-1 truncate">Sage</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-7 rounded-lg bg-surface-container-high shadow-xs"></div>
                    <span className="font-label-sm text-label-sm text-outline mt-1 truncate">Ivory</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md">
              <button
                onClick={() => onNavigate('ideas-and-inspiration')}
                className="w-full flex items-center justify-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface py-2 rounded-xl font-title-md text-title-md transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                <span>View 3D Styling Board</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
