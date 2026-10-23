import React from 'react';
import { Event } from '../../server/models/types.ts';

interface MyEventsProps {
  events: Event[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenCreateEvent: () => void;
}

export const MyEvents: React.FC<MyEventsProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onOpenCreateEvent,
}) => {
  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs text-secondary font-label-sm uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Portfolio of Celebrations</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Active Celebrations</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Curate, review, and switch between your atelier’s luxury wedding portfolios and high-profile milestones.
            </p>
          </div>

          <button
            onClick={onOpenCreateEvent}
            className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create New Celebration</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {events.map((ev) => {
            const isActive = ev.id === activeEventId;
            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className={`p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-outline-variant/30 hover:border-outline-variant hover:shadow-md'
                }`}
              >
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                      {ev.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        ev.status === 'in_progress'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {ev.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-headline-sm text-primary leading-snug">{ev.name}</h3>
                  <p className="text-xs text-outline font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
                    {ev.location} • {ev.venueName}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20 text-xs">
                    <div>
                      <span className="text-outline block uppercase tracking-wider text-[10px]">Budget</span>
                      <span className="font-bold text-primary text-sm">₹{(ev.budgetAmount / 100000).toFixed(1)} Lakhs</span>
                    </div>
                    <div>
                      <span className="text-outline block uppercase tracking-wider text-[10px]">Guest Count</span>
                      <span className="font-bold text-primary text-sm">{ev.guestCount} Invites</span>
                    </div>
                  </div>
                </div>

                <div className="pt-space-md mt-space-sm flex items-center justify-between border-t border-outline-variant/20">
                  <span className="text-xs text-secondary font-semibold">In {ev.daysRemaining} Days</span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      isActive ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {isActive ? 'Active Canvas ✓' : 'Switch Canvas'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
