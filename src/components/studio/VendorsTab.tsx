import React from 'react';
import { AIPlanVersion } from '../../../server/models/types.ts';

interface VendorsTabProps {
  currentPlan?: AIPlanVersion;
  defaultBudget: number;
}

/**
 * Vendor procurement checklist, deliverables scope, booking windows, and estimated allocations.
 */
export const VendorsTab: React.FC<VendorsTabProps> = ({ currentPlan, defaultBudget }) => {
  const planData = currentPlan?.planJson;

  const vendorList = planData?.vendorChecklist || [
    {
      category: 'Catering & Dining',
      roleTitle: 'Master Caterer & Beverage Team',
      keyDeliverables: ['Menu execution', 'Live stations', 'Service staff & ware'],
      estimatedAllocation: Math.round(defaultBudget * 0.35),
      bookingWindow: 'Book 6 weeks prior',
      status: 'must_hire',
    },
    {
      category: 'Sound & Audio Rig',
      roleTitle: 'Live Sound Engineer & Lighting Rig',
      keyDeliverables: ['PA sound system', 'Wireless mics', 'Ambient festoon lighting'],
      estimatedAllocation: Math.round(defaultBudget * 0.18),
      bookingWindow: 'Book 4 weeks prior',
      status: 'must_hire',
    },
  ];

  return (
    <div id="panel-vendors" role="tabpanel" aria-labelledby="tab-vendors" className="space-y-space-lg">
      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-lg">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Procurement &amp; Contracts
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary">Vendor Checklist &amp; Sourcing Matrix</h2>
          <p className="text-sm text-outline mt-1">
            Event-tailored vendor contracts, key deliverables, optimal booking timelines, and estimated allocations.
          </p>
        </div>

        <div className="space-y-space-md">
          {vendorList.map((v, idx) => (
            <div key={idx} className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-primary-fixed text-primary">
                    {v.category}
                  </span>
                  <h4 className="font-title-md text-base font-bold text-primary">{v.roleTitle}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline">{v.bookingWindow}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-secondary text-on-secondary">
                    ₹{v.estimatedAllocation.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-outline uppercase tracking-wider block mb-1">
                  Contract Deliverables Scope:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {v.keyDeliverables.map((del, dIdx) => (
                    <span key={dIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-container-highest text-on-surface text-xs">
                      <span className="material-symbols-outlined text-secondary text-[12px]">check</span>
                      {del}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
