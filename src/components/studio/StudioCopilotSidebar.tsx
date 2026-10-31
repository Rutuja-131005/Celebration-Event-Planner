import React from 'react';
import { AIPlanVersion } from '../../../server/models/types.ts';

interface StudioCopilotSidebarProps {
  plans: AIPlanVersion[];
  selectedPlanIndex: number;
  onSelectPlanIndex: (idx: number) => void;
  customAdjustment: string;
  setCustomAdjustment: (adj: string) => void;
  synthesizing: boolean;
  onQuickAdjustment: (chipText: string) => void;
  onCustomAdjustment: (e: React.FormEvent) => void;
  decibelRegulations?: string;
}

/**
 * Co-pilot sidebar containing one-click adjustments, custom instructions, checkpoint version history, and municipal compliance.
 */
export const StudioCopilotSidebar: React.FC<StudioCopilotSidebarProps> = ({
  plans,
  selectedPlanIndex,
  onSelectPlanIndex,
  customAdjustment,
  setCustomAdjustment,
  synthesizing,
  onQuickAdjustment,
  onCustomAdjustment,
  decibelRegulations,
}) => {
  const quickActions = [
    { label: 'Shift guest turnout by +15%', icon: 'group_add' },
    { label: 'Compress decor by 10% to boost catering buffer', icon: 'compress' },
    { label: 'Add rain contingency and marquee setup', icon: 'umbrella' },
    { label: 'Upgrade to live acoustic Sufi or Jazz ensemble', icon: 'music_note' },
  ];

  return (
    <div className="xl:col-span-4 flex flex-col space-y-space-md">
      {/* Quick Calibration Panel */}
      <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
            <h3 className="font-title-lg text-title-lg text-primary">Quick Adjustments</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-fixed text-primary tracking-wide uppercase">
            Co-Pilot
          </span>
        </div>
        <p className="font-body-sm text-xs text-on-surface-variant">
          One-tap adjustments to instantly recalibrate budgets, headcount shifts, and timeline milestones.
        </p>

        <div className="flex flex-col gap-space-xs">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onQuickAdjustment(action.label)}
              disabled={synthesizing}
              className="w-full text-left p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-between group cursor-pointer text-xs font-medium text-on-surface disabled:opacity-50"
              type="button"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[16px]">{action.icon}</span>
                <span>{action.label}</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
            </button>
          ))}
        </div>

        {/* Custom Adjustment Input */}
        <form onSubmit={onCustomAdjustment} className="pt-space-xs">
          <label htmlFor="custom-adjustment-input" className="font-label-sm text-xs text-outline block mb-1 uppercase tracking-wider">
            Custom Adjustment
          </label>
          <div className="flex gap-1.5">
            <input
              id="custom-adjustment-input"
              type="text"
              value={customAdjustment}
              onChange={(e) => setCustomAdjustment(e.target.value)}
              placeholder="e.g. Add 2 zero-proof mocktail bars..."
              className="flex-1 bg-surface-container-low px-3 py-2 rounded-xl text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={synthesizing || !customAdjustment.trim()}
              className="w-9 h-9 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shrink-0 hover:bg-on-secondary-container transition-all cursor-pointer disabled:opacity-50"
              aria-label="Apply custom adjustment"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Checkpoint Version History */}
      <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-sm">
        <div className="flex items-center justify-between">
          <h4 className="font-title-md text-sm font-bold text-primary">Blueprint Checkpoints</h4>
          <span className="font-label-sm text-xs text-outline">{plans.length} Versions</span>
        </div>

        <div className="space-y-space-xs max-h-56 overflow-y-auto">
          {plans.map((pl, idx) => {
            const isCurrent = idx === selectedPlanIndex;
            return (
              <div
                key={pl.id}
                onClick={() => onSelectPlanIndex(idx)}
                className={`p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-primary-fixed/40 border border-primary/20'
                    : 'bg-surface-container-low hover:bg-surface-container'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className={`text-xs truncate leading-tight ${isCurrent ? 'text-primary font-bold' : 'text-on-surface font-medium'}`}>
                    {pl.versionNumber} • {pl.versionTitle}
                  </span>
                  <span className="text-[11px] text-outline truncate">
                    {pl.curationConcept}
                  </span>
                </div>
                {isCurrent ? (
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0">check_circle</span>
                ) : (
                  <span className="text-[11px] text-secondary hover:underline shrink-0">View</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Venue & Sound Permitting Badge */}
      <div className="p-space-md rounded-2xl bg-surface-container flex items-start gap-space-sm border border-outline-variant/20">
        <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">verified_user</span>
        <div className="space-y-0.5">
          <p className="font-title-md text-xs text-on-surface font-bold">Sound &amp; Municipal Compliance</p>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            {decibelRegulations ||
              'Sound levels regulated in compliance with local civic venue guidelines. Cutoff and transition guidelines certified.'}
          </p>
        </div>
      </div>
    </div>
  );
};
