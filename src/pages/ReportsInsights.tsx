import React from 'react';
import { Event, Prediction, BudgetMetrics } from '../../server/models/types.ts';

interface ReportsInsightsProps {
  event: Event;
  prediction: Prediction | null;
  metrics: BudgetMetrics | null;
}

export const ReportsInsights: React.FC<ReportsInsightsProps> = ({
  event,
  prediction,
  metrics,
}) => {
  const committedAmount = metrics?.committedAmount || 0;
  const committedPct = metrics?.committedPercentage !== undefined ? metrics.committedPercentage : 0;
  const variance = metrics?.variance || 0;
  const isSurplus = variance >= 0;
  const variancePct = event.budgetAmount > 0 ? Math.round((Math.abs(variance) / event.budgetAmount) * 1000) / 10 : 0;

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="space-y-space-xs">
            <div className="flex items-center gap-space-xs text-secondary font-label-sm uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>Executive Dossier &amp; Predictive Audit</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Reports &amp; Executive Insights
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Consolidated financial statements, vendor milestone drawdowns, and predictive analytics audit report for {event.name}.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container px-space-md py-2.5 rounded-xl font-title-md text-title-md shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print Executive Summary</span>
          </button>
        </div>

        {/* Executive Summary Card */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-md">
          <div className="flex flex-wrap items-center justify-between border-b border-outline-variant/30 pb-4">
            <div>
              <span className="text-xs font-semibold text-outline uppercase tracking-wider">Celebration</span>
              <h2 className="font-headline-sm text-primary font-bold">{event.name}</h2>
              <p className="text-xs text-on-surface-variant">Code: {event.code} • Location: {event.location}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider">Audit Date</span>
              <p className="font-title-md font-bold text-primary">{new Date().toLocaleDateString('en-GB')}</p>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-tertiary-fixed text-on-tertiary-fixed">
                Audit Clearance Validated
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-2">
            <div className="p-4 rounded-xl bg-surface-container-low">
              <span className="text-xs text-outline uppercase tracking-wider block font-semibold">Sanctioned Envelope</span>
              <p className="text-2xl font-bold text-primary mt-1">₹{event.budgetAmount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-on-surface-variant mt-1">Target Fiscal Envelope</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low">
              <span className="text-xs text-outline uppercase tracking-wider block font-semibold">Committed Disbursals</span>
              <p className="text-2xl font-bold text-secondary mt-1">₹{committedAmount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-on-surface-variant mt-1">{committedPct}% of envelope locked</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low">
              <span className="text-xs text-outline uppercase tracking-wider block font-semibold">Net Projected {isSurplus ? 'Surplus' : 'Deficit'}</span>
              <p className="text-2xl font-bold text-tertiary mt-1">₹{Math.abs(variance).toLocaleString('en-IN')}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {variancePct}% {isSurplus ? 'surplus reserve' : 'overrun risk'}
              </p>
            </div>
          </div>

          {/* Predictive Model Section */}
          <div className="pt-4 border-t border-outline-variant/30 space-y-2">
            <h3 className="font-title-lg text-primary font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">insights</span>
              Predictive Telemetry Findings
            </h3>
            <p className="text-sm text-on-surface leading-relaxed">
              {prediction?.explanation ||
                `Automated predictive modeling calibrated for ${event.location || 'this celebration'} indicates stable financial variance with high confidence of execution within the approved baseline envelope.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
