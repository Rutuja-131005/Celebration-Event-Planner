import React from 'react';
import { AIPlanVersion } from '../../../server/models/types.ts';

interface BlueprintHeroBarProps {
  currentPlan?: AIPlanVersion;
  applyingPlan: boolean;
  onApplyPlan: () => void;
}

/**
 * Action bar allowing the planner to inspect the current blueprint checkpoint and apply it to live event data.
 */
export const BlueprintHeroBar: React.FC<BlueprintHeroBarProps> = ({
  currentPlan,
  applyingPlan,
  onApplyPlan,
}) => {
  return (
    <div className="p-space-md rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-sm">
        <span className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary material-symbols-outlined text-[20px] shrink-0">
          sync_saved_locally
        </span>
        <div>
          <h4 className="font-title-md text-title-md text-primary font-semibold">
            {currentPlan?.versionTitle || 'Generated Blueprint'}
          </h4>
          <p className="font-body-sm text-body-sm text-outline">
            {currentPlan?.curationConcept || 'Personalized plan ready for implementation'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onApplyPlan}
        disabled={applyingPlan || !currentPlan}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-title-md text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0"
      >
        <span className={`material-symbols-outlined text-[18px] ${applyingPlan ? 'animate-spin' : ''}`}>
          {applyingPlan ? 'sync' : 'publish'}
        </span>
        <span>{applyingPlan ? 'Applying Plan...' : 'Apply Plan to Live Event'}</span>
      </button>
    </div>
  );
};
