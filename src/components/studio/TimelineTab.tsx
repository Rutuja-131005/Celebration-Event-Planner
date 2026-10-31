import React from 'react';
import { AIPlanVersion } from '../../../server/models/types.ts';

interface TimelineTabProps {
  currentPlan?: AIPlanVersion;
}

/**
 * Pre-event milestone roadmap and day-of minute-by-minute run of show itinerary.
 */
export const TimelineTab: React.FC<TimelineTabProps> = ({ currentPlan }) => {
  const planData = currentPlan?.planJson;

  const milestones = planData?.milestoneTimeline || [
    { timeframe: '8 Weeks Prior', milestone: 'Contract Core Venue & Date Lock', description: 'Execute agreements and secure deposits.', priority: 'high' },
    { timeframe: '4 Weeks Prior', milestone: 'Menu & Tastings Approval', description: 'Confirm final culinary selections.', priority: 'medium' },
    { timeframe: '1 Week Prior', milestone: 'Final Guest Roster & RSVPs', description: 'Transmit numbers to caterer and sound techs.', priority: 'high' },
  ];

  const itinerary = planData?.itinerary || [];

  return (
    <div id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline" className="space-y-space-lg">
      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-lg">
        {/* Pre-Event Milestone Timeline */}
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Phase 1: Planning Milestones
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-3">Pre-Event Milestone Roadmap</h2>
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-container-low flex items-start justify-between gap-3 border border-outline-variant/20">
                <div className="space-y-0.5">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-secondary-fixed text-on-secondary-fixed font-bold uppercase tracking-wider">
                    {m.timeframe}
                  </span>
                  <h4 className="font-title-md text-sm font-bold text-primary mt-1">{m.milestone}</h4>
                  <p className="text-xs text-on-surface-variant">{m.description}</p>
                </div>
                <span className="text-[11px] font-semibold text-tertiary uppercase tracking-wider shrink-0">
                  {m.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Day-Of Minute-by-Minute Run of Show */}
        <div className="pt-space-md border-t border-outline-variant/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-3">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                Phase 2: Execution Day
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary">Day-Of Minute-by-Minute Run of Show</h2>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-xs transition-all self-start cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Run Sheet</span>
            </button>
          </div>

          <div className="relative pl-6 space-y-space-md before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
            {itinerary.map((step, idx) => (
              <div key={idx} className="relative flex items-start gap-space-md group">
                <span
                  className="absolute -left-6 top-1.5 w-3 h-3 rounded-full ring-4 ring-background"
                  style={{ backgroundColor: step.colorDot || '#381727' }}
                />
                <div className="p-space-md rounded-xl bg-surface-container-low group-hover:bg-surface-container transition-all flex-1 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-title-md text-title-md text-primary font-semibold text-sm md:text-base">
                      {step.time} – {step.title}
                    </span>
                    <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                      {step.locationTag}
                    </span>
                  </div>
                  <p className="font-body-md text-xs md:text-sm text-on-surface-variant">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
