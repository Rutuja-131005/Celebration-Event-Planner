import React from 'react';
import { Event } from '../../../server/models/types.ts';

interface StudioHeaderProps {
  event: Event;
  eventTypeCategory: 'destination_wedding' | 'wedding' | 'birthday' | 'community' | 'custom';
}

/**
 * Header section for AI Planning Studio displaying canvas identity, target specs, and active domain.
 */
export const StudioHeader: React.FC<StudioHeaderProps> = ({ event, eventTypeCategory }) => {
  return (
    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg border-b border-outline-variant/30">
      <div className="space-y-space-xs max-w-2xl">
        <div className="flex flex-wrap items-center gap-space-sm mb-space-xs">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            GenAI Planning Assistant
          </span>
          <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Weddings • Birthdays • Community Events
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-primary tracking-tight">AI Planning Studio</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Generate bespoke budgets, minute-by-minute timelines, vendor sourcing checklists, and personalized creative ideas for any celebration.
        </p>
      </div>

      {/* Active Canvas Badge */}
      <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(81,44,61,0.06)] max-w-md w-full border border-outline-variant/30">
        <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[24px]">
            {eventTypeCategory === 'destination_wedding'
              ? 'flight_takeoff'
              : eventTypeCategory === 'birthday'
              ? 'cake'
              : eventTypeCategory === 'community'
              ? 'festival'
              : 'celebration'}
          </span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
              Active Canvas
            </span>
            <span className="font-label-sm text-label-sm text-outline">{event.location}</span>
          </div>
          <p className="font-title-md text-title-md text-on-surface truncate">{event.name}</p>
          <div className="flex items-center gap-space-sm text-outline font-body-sm text-body-sm mt-0.5">
            <span>{event.guestCount} Guests</span>
            <span>•</span>
            <span className="font-medium text-on-surface">
              ₹{event.budgetAmount.toLocaleString('en-IN')} Cap
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
