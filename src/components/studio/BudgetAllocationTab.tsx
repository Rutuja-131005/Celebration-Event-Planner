import React from 'react';
import { AIPlanVersion } from '../../../server/models/types.ts';

interface BudgetCategoryItem {
  name: string;
  amount: number;
  percentage: number;
  priority: string;
  note: string;
}

interface BudgetAllocationTabProps {
  totalBudget: number;
  budgetCategories: BudgetCategoryItem[];
  currentPlan?: AIPlanVersion;
}

/**
 * Computational algorithmic budget allocation, visual distribution bar, and arbitrage savings insight.
 */
export const BudgetAllocationTab: React.FC<BudgetAllocationTabProps> = ({
  totalBudget,
  budgetCategories,
  currentPlan,
}) => {
  const planData = currentPlan?.planJson;
  const colors = [
    'bg-primary-container',
    'bg-secondary',
    'bg-primary-fixed-dim',
    'bg-tertiary-container',
    'bg-outline-variant',
    'bg-secondary-container',
  ];

  return (
    <div id="panel-budget" role="tabpanel" aria-labelledby="tab-budget" className="space-y-space-lg">
      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Algorithmic Allocation
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              ₹{totalBudget.toLocaleString('en-IN')} Total Budget Plan
            </h2>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-1 rounded-full self-start">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-label-md text-label-md text-on-surface font-medium">
              100% Balanced Allocation
            </span>
          </div>
        </div>

        {/* Visual Distribution Bar */}
        <div className="space-y-space-xs">
          <div className="w-full h-5 rounded-full overflow-hidden flex shadow-inner">
            {budgetCategories.map((cat, idx) => (
              <div
                key={idx}
                className={colors[idx % colors.length]}
                style={{ width: `${cat.percentage}%` }}
                title={`${cat.name} (${cat.percentage}%)`}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between text-outline font-label-sm text-xs pt-1 gap-2">
            {budgetCategories.map((cat, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <span className="font-semibold text-primary">{cat.name}</span>
                <span>{cat.percentage}%</span>
              </span>
            ))}
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="divide-y divide-outline-variant/30 space-y-space-sm pt-space-xs">
          {budgetCategories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between py-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary material-symbols-outlined text-[18px]">
                  {idx === 0 ? 'restaurant' : idx === 1 ? 'apartment' : idx === 2 ? 'palette' : idx === 3 ? 'music_note' : 'savings'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-title-md text-title-md text-on-surface font-semibold">{cat.name}</p>
                    <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider bg-surface-container-high text-outline">
                      {cat.priority}
                    </span>
                  </div>
                  <span className="font-body-sm text-xs text-outline">{cat.note}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-title-md text-title-md text-primary font-bold">
                  ₹{cat.amount.toLocaleString('en-IN')}
                </span>
                <span className="block font-label-sm text-xs text-outline">{cat.percentage}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Arbitrage Savings Insight */}
        <div className="p-space-md rounded-xl bg-surface-container border-l-4 border-secondary flex gap-space-md">
          <span className="material-symbols-outlined text-secondary text-[24px] shrink-0 mt-0.5">
            tips_and_updates
          </span>
          <div className="space-y-1">
            <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
              AI Cost Arbitrage &amp; Savings Insight
            </span>
            <p className="font-body-md text-sm text-on-surface">
              {planData?.budgetRebalance?.arbitrageInsight ||
                'By contracting local regional providers and packaging venue with in-house sound logistics, you unlock significant arbitrage savings that protect your contingency reserve.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
