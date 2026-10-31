import React, { useState, useMemo } from 'react';
import { BudgetCategory, Expense, BudgetMetrics } from '../../server/models/types.ts';
import { predictionsService } from '../services/predictions.ts';
import { budgetService } from '../services/budget.ts';

interface BudgetForecastProps {
  eventId: string;
  categories: BudgetCategory[];
  expenses: Expense[];
  metrics: BudgetMetrics | null;
  onOpenAddExpense: () => void;
  onRefreshData: () => void;
}

export const BudgetForecast: React.FC<BudgetForecastProps> = ({
  eventId,
  categories,
  expenses,
  metrics,
  onOpenAddExpense,
  onRefreshData,
}) => {
  // Scenario Simulator interactive state
  const [guestShift, setGuestShift] = useState<number>(15);
  const [decorTier, setDecorTier] = useState<'classic' | 'couture' | 'regal'>('couture');
  const [barPackage, setBarPackage] = useState<'baseline' | 'vintage_champagne'>('baseline');
  const [savingSnapshot, setSavingSnapshot] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);

  // Expense stream search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [appliedClause, setAppliedClause] = useState(false);

  // Format currency helpers
  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  // Memoized dynamic calculations for scenario simulator to eliminate redundant re-renders
  const {
    guestCostImpact,
    decorTierCost,
    barCost,
    netVariance,
    simulatedFinalOutlay,
    isBufferDrawn,
    bufferDrawnAmount,
    netSurplusAmount,
  } = useMemo(() => {
    const guestCost = guestShift * 1500;
    let decorCost = 0;
    if (decorTier === 'classic') decorCost = -35000;
    else if (decorTier === 'couture') decorCost = 0;
    else if (decorTier === 'regal') decorCost = 75000;

    const bar = barPackage === 'vintage_champagne' ? 65000 : 0;
    const variance = guestCost + decorCost + bar;
    const baseForecast = metrics?.forecastedTotal || 2415000;
    const outlay = baseForecast + variance;
    const baseline = metrics?.baselineBudget || 2500000;
    const bufferDrawn = outlay > baseline;

    return {
      guestCostImpact: guestCost,
      decorTierCost: decorCost,
      barCost: bar,
      netVariance: variance,
      simulatedFinalOutlay: outlay,
      isBufferDrawn: bufferDrawn,
      bufferDrawnAmount: bufferDrawn ? outlay - baseline : 0,
      netSurplusAmount: !bufferDrawn ? baseline - outlay : 0,
    };
  }, [guestShift, decorTier, barPackage, metrics]);

  const baselineBudget = metrics?.baselineBudget || 2500000;

  const handleResetSimulation = () => {
    setGuestShift(0);
    setDecorTier('couture');
    setBarPackage('baseline');
  };

  const handleSaveSnapshot = async () => {
    try {
      setSavingSnapshot(true);
      await predictionsService.runScenario(
        eventId,
        guestShift,
        decorTier,
        barPackage,
        true,
        `Scenario Snapshot (${guestShift >= 0 ? '+' : ''}${guestShift} Guests, ${decorTier})`
      );
      setSnapshotSuccess('Scenario snapshot saved to database successfully!');
      setTimeout(() => setSnapshotSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSnapshot(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to remove this expense record?')) return;
    try {
      await budgetService.deleteExpense(expenseId);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Memoized filter for expenses stream to eliminate redundant computations on re-render
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const cat = categoryFilter.toLowerCase();
    return expenses.filter((exp) => {
      const matchesSearch =
        !q ||
        exp.description.toLowerCase().includes(q) ||
        exp.vendorName.toLowerCase().includes(q) ||
        exp.voucherCode.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === 'All' || exp.categoryName.toLowerCase().includes(cat);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Settled' && exp.paymentStatus === 'settled') ||
        (statusFilter === 'Tranche Due' && exp.paymentStatus === 'drawdown_partial') ||
        (statusFilter === 'Pending Invoice' && exp.paymentStatus === 'pending_invoice');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenses, searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        {/* Page Header & Action Ledger Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col space-y-space-xs">
            <div className="flex items-center gap-space-sm text-outline font-label-sm uppercase tracking-widest">
              <span>Fiscal Folio</span>
              <span>•</span>
              <span>Ananya &amp; Rohan’s Celebration</span>
              <span>•</span>
              <span className="text-secondary font-semibold">INR (₹) Standard</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Budget &amp; Predictive Forecast
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Real-time cost tracking, contingency buffers, and AI predictive overrun risk modeling tailored to atelier standards.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center bg-surface-container-high px-space-sm py-1.5 rounded-xl shadow-sm">
              <span className="font-label-sm text-label-sm text-outline mr-1.5 uppercase font-semibold">
                Currency:
              </span>
              <span className="font-label-md text-label-md font-bold text-primary flex items-center gap-0.5">
                ₹ Lakhs <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </span>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('scenario-simulator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-title-md text-title-md px-space-md py-space-sm rounded-xl shadow-sm transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
              <span>Simulate Scenario</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-title-md text-title-md px-space-md py-space-sm rounded-xl shadow-sm transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
              <span>Export Ledger</span>
            </button>
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary font-title-md text-title-md px-space-md py-space-sm rounded-xl shadow-md transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Editorial 5-Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm uppercase tracking-wider">Baseline Budget</span>
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div className="my-space-sm">
              <div className="font-headline-md text-headline-md text-primary">₹25,00,000</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Approved fiscal envelope</div>
            </div>
            <div className="font-label-sm text-label-sm text-outline">Sanctioned Mar 12, 2025</div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm uppercase tracking-wider">Committed / Spent</span>
              <span className="material-symbols-outlined text-[20px] text-secondary">payments</span>
            </div>
            <div className="my-space-sm">
              <div className="font-headline-md text-headline-md text-secondary">₹16,80,000</div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                <span className="font-bold text-secondary">67.2%</span> of total allocation
              </div>
            </div>
            <div
              className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={67.2}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Budget committed: 67.2% of total allocation"
            >
              <div className="bg-secondary h-full rounded-full" style={{ width: '67.2%' }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm uppercase tracking-wider">Forecasted Total</span>
              <span className="material-symbols-outlined text-[20px] text-tertiary">query_stats</span>
            </div>
            <div className="my-space-sm">
              <div className="font-headline-md text-headline-md text-primary">₹24,15,000</div>
              <div className="flex items-center gap-1 text-tertiary-container font-label-sm text-label-sm mt-0.5">
                <span className="material-symbols-outlined text-[16px]">trending_down</span>
                <span className="font-bold">₹85,000 Surplus (3.4%)</span>
              </div>
            </div>
            <div className="font-label-sm text-label-sm text-outline">AI Predictive Model v2.4</div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm uppercase tracking-wider">Free Cash Flow</span>
              <span className="material-symbols-outlined text-[20px]">account_balance</span>
            </div>
            <div className="my-space-sm">
              <div className="font-headline-md text-headline-md text-primary">₹8,20,000</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Uncommitted balance</div>
            </div>
            <div className="font-label-sm text-label-sm text-outline">Tranche 3 due in 18 days</div>
          </div>

          {/* Card 5 */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-outline">
              <span className="font-label-sm uppercase tracking-wider">Contingency Pool</span>
              <span className="material-symbols-outlined text-[20px] text-tertiary">shield</span>
            </div>
            <div className="my-space-sm">
              <div className="font-headline-md text-headline-md text-tertiary-container">₹2,00,000</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Buffer (8.0% of total)</div>
            </div>
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-tertiary font-medium">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
              <span>100% Unencumbered</span>
            </div>
          </div>
        </div>

        {/* Predictive Overrun & Risk Intelligence Panel */}
        <div className="bg-surface-container-low p-space-lg rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md mb-space-md">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[24px]">insights</span>
              </div>
              <div>
                <div className="flex items-center gap-space-sm">
                  <h2 className="font-title-lg text-title-lg text-primary">
                    Predictive Overrun &amp; Financial Risk Model
                  </h2>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed px-space-sm py-0.5 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Low Overall Risk • 94% Confidence</span>
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Automated analysis cross-referenced against 120+ atelier weddings in Rajasthan &amp; Delhi NCR.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-space-xs text-outline font-label-sm">
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Updated 42 mins ago</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {/* Factor 1: Contract Analysis */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-sm uppercase text-outline">Primary Variable</span>
                  <span className="text-tertiary font-label-sm font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">lock</span> Fixed Price Clause
                  </span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-space-xs">
                  Venue &amp; Lodging Stability
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Committed hotel master agreements carry zero peak-rate volatility. Catering guarantees locked at 320 plates.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-1.5 font-label-sm text-outline">
                <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                <span>Zero escalation exposure</span>
              </div>
            </div>

            {/* Factor 2: Beverage Variance Warning */}
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-label-sm uppercase text-secondary font-bold">Watchlist Item</span>
                  <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-space-xs py-0.5 rounded font-label-sm font-medium">
                    Volatile
                  </span>
                </div>
                <h3 className="font-title-md text-title-md text-on-surface mb-space-xs">
                  Beverage &amp; Spirits Consumption
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Current forecast models 2.4 drinks/guest. A ±10% shift in attendance (±32 guests) introduces an unhedged +₹45,000 variance.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center gap-1.5 font-label-sm text-secondary font-medium">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                <span>Simulated deviation: +1.8% of budget</span>
              </div>
            </div>

            {/* Factor 3: AI Recommendation Station */}
            <div className="bg-primary-container text-on-primary p-space-md rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-on-primary-container font-label-sm uppercase tracking-wider mb-space-xs">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Studio Action Plan</span>
                </div>
                <h3 className="font-title-md text-title-md text-surface mb-space-xs">
                  Execute Returnable Stock Deal
                </h3>
                <p className="font-body-sm text-body-sm text-surface-variant">
                  Contract premium single-malts &amp; champagne through verified distributor with a 100% buyback clause on unopened sealed crates.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs flex items-center justify-between">
                <span className="font-label-sm text-tertiary-fixed font-semibold">Saves ~₹38,000 risk</span>
                <button
                  onClick={() => setAppliedClause(!appliedClause)}
                  className="bg-surface text-primary px-space-sm py-1 rounded-lg font-label-sm text-label-sm font-bold hover:bg-surface-container transition-all cursor-pointer"
                  type="button"
                >
                  {appliedClause ? 'Clause Locked ✓' : 'Apply Clause'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Split View: Category Breakdown Ledger & Interactive Scenario Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Left Column: Category Allocation & Variance Ledger (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Category Allocation &amp; Variance Ledger
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Line-item comparison between planned budget and active commitments
                </p>
              </div>
              <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-space-xs py-0.5 rounded-lg font-label-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'active'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`px-space-xs py-0.5 rounded-lg font-label-sm transition-all cursor-pointer ${
                    activeTab === 'archived'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Archived
                </button>
              </div>
            </div>

            {/* Ledger Table Container */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm" aria-label="Category Allocation and Variance Ledger">
                  <thead className="bg-surface-container-low text-outline font-label-sm uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="py-space-sm px-space-md">Expense Dimension</th>
                      <th scope="col" className="py-space-sm px-space-sm">Allocation</th>
                      <th scope="col" className="py-space-sm px-space-sm">Committed</th>
                      <th scope="col" className="py-space-sm px-space-sm">Status</th>
                      <th scope="col" className="py-space-sm px-space-sm text-right">Variance</th>
                      <th scope="col" className="py-space-sm px-space-md text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-on-surface">
                    {categories.map((cat, idx) => {
                      const variance = cat.committedAmount - cat.plannedAmount;
                      const isNegative = variance < 0;
                      const isPositive = variance > 0;

                      let icon = 'hotel';
                      if (cat.categoryName.includes('Catering')) icon = 'restaurant';
                      if (cat.categoryName.includes('Decor')) icon = 'local_florist';
                      if (cat.categoryName.includes('Photo')) icon = 'photo_camera';
                      if (cat.categoryName.includes('Entertainment')) icon = 'music_note';
                      if (cat.categoryName.includes('Invitations')) icon = 'card_giftcard';

                      return (
                        <tr
                          key={cat.id}
                          className={`hover:bg-surface-container-high transition-colors ${
                            idx % 2 === 1 ? 'bg-surface-container-low/40' : ''
                          }`}
                        >
                          <td className="py-space-md px-space-md">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-8 h-8 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                              </div>
                              <div>
                                <div className="font-title-md text-title-md text-primary">{cat.categoryName}</div>
                                <div className="font-label-sm text-label-sm text-outline">
                                  {cat.notes || 'Master atelier dimension'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-space-md px-space-sm font-semibold">
                            ₹{cat.plannedAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-space-md px-space-sm">
                            ₹{cat.committedAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-space-md px-space-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-medium ${
                                cat.status === 'paid_100'
                                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                                  : cat.status === 'quoted'
                                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                                  : 'bg-surface-container-highest text-on-surface-variant'
                              }`}
                            >
                              {cat.status === 'paid_100'
                                ? 'Paid 100%'
                                : cat.status === 'advance_50'
                                ? 'Advance 50%'
                                : cat.status === 'quoted'
                                ? 'Quoted'
                                : cat.status === 'booked'
                                ? 'Booked'
                                : 'In Progress'}
                            </span>
                          </td>
                          <td
                            className={`py-space-md px-space-sm text-right font-semibold ${
                              isNegative
                                ? 'text-tertiary-container'
                                : isPositive
                                ? 'text-secondary font-bold'
                                : 'text-outline font-medium'
                            }`}
                          >
                            {isNegative
                              ? `-₹${Math.abs(variance).toLocaleString('en-IN')}`
                              : isPositive
                              ? `+₹${variance.toLocaleString('en-IN')}`
                              : '₹0'}
                          </td>
                          <td className="py-space-md px-space-md text-right">
                            <button
                              onClick={onOpenAddExpense}
                              className="text-outline hover:text-primary transition-colors cursor-pointer"
                              title="Add expense under this category"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive "What-If" Scenario Simulator (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-space-md" id="scenario-simulator">
            <div>
              <div className="flex items-center gap-1.5 text-secondary font-label-sm uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Dynamic Sensitivity</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-primary">Scenario Simulator</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Model instantaneous effects on total outlay &amp; surplus buffer.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-md flex-1 flex flex-col justify-between">
              <div className="space-y-space-md">
                {snapshotSuccess && (
                  <div className="p-2.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">
                    {snapshotSuccess}
                  </div>
                )}

                {/* Accessible live region for dynamic calculations */}
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  {`Scenario updated: Guest shift is ${guestShift > 0 ? '+' : ''}${guestShift} guests. Decor tier is ${decorTier}. Bar package is ${barPackage}. Net variance is ${netVariance >= 0 ? '+' : '-'}${formatINR(Math.abs(netVariance))}. Simulated final outlay is ${formatINR(simulatedFinalOutlay)}. ${isBufferDrawn ? `Draws ${formatINR(bufferDrawnAmount)} from contingency buffer.` : `Contingency intact with net surplus ${formatINR(netSurplusAmount)}.`}`}
                </div>

                {/* Visually-hidden summary table for screen readers */}
                <div className="sr-only">
                  <table aria-label="Scenario Simulator Calculation Summary">
                    <thead>
                      <tr>
                        <th scope="col">Variable</th>
                        <th scope="col">Selection</th>
                        <th scope="col">Variance Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Guest Shift</td>
                        <td>{guestShift > 0 ? `+${guestShift}` : guestShift} Guests</td>
                        <td>{guestCostImpact >= 0 ? '+' : ''}{formatINR(guestCostImpact)}</td>
                      </tr>
                      <tr>
                        <td>Decor Tier</td>
                        <td>{decorTier}</td>
                        <td>{decorTierCost >= 0 ? '+' : ''}{formatINR(decorTierCost)}</td>
                      </tr>
                      <tr>
                        <td>Beverage Package</td>
                        <td>{barPackage}</td>
                        <td>{barCost >= 0 ? '+' : ''}{formatINR(barCost)}</td>
                      </tr>
                      <tr>
                        <td>Simulated Final Outlay</td>
                        <td>{formatINR(simulatedFinalOutlay)}</td>
                        <td>{netVariance >= 0 ? '+' : '-'}{formatINR(Math.abs(netVariance))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Slider 1: Guest Count Adjustment */}
                <div className="space-y-space-xs">
                  <div className="flex justify-between items-center">
                    <label htmlFor="guest-shift-slider" className="font-label-md text-label-md font-semibold text-primary">
                      Guest Count Shift
                    </label>
                    <span className="font-label-md text-label-md text-secondary font-bold" id="guest-shift-val">
                      {guestShift > 0 ? `+${guestShift}` : guestShift} Guests
                    </span>
                  </div>
                  <input
                    id="guest-shift-slider"
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={guestShift}
                    aria-label="Adjust guest count shift"
                    aria-valuemin={-50}
                    aria-valuemax={50}
                    aria-valuenow={guestShift}
                    aria-valuetext={`${guestShift > 0 ? '+' : ''}${guestShift} guests, cost impact ${guestCostImpact >= 0 ? '+' : ''}${formatINR(guestCostImpact)}`}
                    onChange={(e) => setGuestShift(parseInt(e.target.value, 10))}
                    className="w-full accent-secondary bg-surface-container-high h-1.5 rounded-lg appearance-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  />
                  <div className="flex justify-between font-label-sm text-label-sm text-outline" aria-hidden="true">
                    <span>-50 pax</span>
                    <span>Baseline (320)</span>
                    <span>+50 pax</span>
                  </div>
                </div>

                {/* Selector 2: Decor Tier Production */}
                <div className="space-y-space-xs">
                  <span id="decor-tier-label" className="font-label-md text-label-md font-semibold text-primary block">
                    Decor Production Tier
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="decor-tier-label"
                    className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-xl text-center"
                  >
                    <button
                      onClick={() => setDecorTier('classic')}
                      type="button"
                      role="radio"
                      aria-checked={decorTier === 'classic'}
                      className={`decor-opt py-1.5 rounded-lg font-label-sm transition-all cursor-pointer ${
                        decorTier === 'classic'
                          ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                          : 'text-outline hover:text-primary'
                      }`}
                    >
                      Classic
                    </button>
                    <button
                      onClick={() => setDecorTier('couture')}
                      type="button"
                      role="radio"
                      aria-checked={decorTier === 'couture'}
                      className={`decor-opt py-1.5 rounded-lg font-label-sm transition-all cursor-pointer ${
                        decorTier === 'couture'
                          ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                          : 'text-outline hover:text-primary'
                      }`}
                    >
                      Couture
                    </button>
                    <button
                      onClick={() => setDecorTier('regal')}
                      type="button"
                      role="radio"
                      aria-checked={decorTier === 'regal'}
                      className={`decor-opt py-1.5 rounded-lg font-label-sm transition-all cursor-pointer ${
                        decorTier === 'regal'
                          ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                          : 'text-outline hover:text-primary'
                      }`}
                    >
                      Royal Grand
                    </button>
                  </div>
                </div>

                {/* Selector 3: Hospitality & Bar Menu Package */}
                <div className="space-y-space-xs">
                  <span id="bar-package-label" className="font-label-md text-label-md font-semibold text-primary block">
                    Hospitality Beverage Curations
                  </span>
                  <div role="radiogroup" aria-labelledby="bar-package-label" className="space-y-1.5">
                    <label
                      onClick={() => setBarPackage('baseline')}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        barPackage === 'baseline'
                          ? 'bg-surface-container border border-primary/20'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="bar_package"
                          value="baseline"
                          checked={barPackage === 'baseline'}
                          onChange={() => setBarPackage('baseline')}
                          className="accent-primary"
                        />
                        <span className="font-body-sm text-body-sm text-on-surface">Standard Premium Artisanal</span>
                      </span>
                      <span className="font-label-sm text-label-sm text-outline">Baseline</span>
                    </label>

                    <label
                      onClick={() => setBarPackage('vintage_champagne')}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        barPackage === 'vintage_champagne'
                          ? 'bg-surface-container border border-secondary/30'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="bar_package"
                          value="vintage_champagne"
                          checked={barPackage === 'vintage_champagne'}
                          onChange={() => setBarPackage('vintage_champagne')}
                          className="accent-primary"
                        />
                        <span className="font-body-sm text-body-sm text-on-surface">Vintage Champagne Addition</span>
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary font-medium">+₹65,000</span>
                    </label>
                  </div>
                </div>

                {/* Calculated Impact Block */}
                <div className="bg-surface-container p-space-sm rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-outline font-label-sm">
                    <span>Simulated Variance</span>
                    <span
                      className={`font-bold ${
                        netVariance >= 0 ? 'text-secondary' : 'text-tertiary-container'
                      }`}
                    >
                      {netVariance >= 0 ? '+' : '-'}
                      {formatINR(Math.abs(netVariance))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-title-md text-title-md text-primary font-semibold">
                      Simulated Final Outlay
                    </span>
                    <span className="font-title-lg text-title-lg text-primary font-bold">
                      {formatINR(simulatedFinalOutlay)}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 font-label-sm pt-1 ${
                      isBufferDrawn ? 'text-secondary' : 'text-tertiary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isBufferDrawn ? 'priority_high' : 'check_circle'}
                    </span>
                    <span>
                      {isBufferDrawn
                        ? `Draws ${formatINR(bufferDrawnAmount)} from ₹2.0L contingency buffer`
                        : `Contingency intact • Net surplus ${formatINR(netSurplusAmount)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-space-sm flex gap-2">
                <button
                  onClick={handleResetSimulation}
                  className="flex-1 py-2 rounded-xl bg-surface-container-high text-on-surface font-title-md text-title-md hover:bg-surface-container-highest transition-colors cursor-pointer"
                  type="button"
                >
                  Reset
                </button>
                <button
                  onClick={handleSaveSnapshot}
                  disabled={savingSnapshot}
                  className="flex-1 py-2 rounded-xl bg-secondary text-on-secondary font-title-md text-title-md shadow-sm hover:bg-on-secondary-container transition-colors cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  {savingSnapshot ? 'Saving...' : 'Save Snapshot'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Transaction Stream & Audit Trail */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm space-y-space-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">Expense Stream &amp; Audit Trail</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Validated payment vouchers, milestone drawdowns, and supplier reconciliation.
              </p>
            </div>

            {/* Filters & Search Toolbar */}
              <div className="flex flex-wrap items-center gap-space-xs">
                <div className="flex items-center bg-surface-container-low px-space-sm py-1.5 rounded-xl text-outline w-56">
                  <span className="material-symbols-outlined text-[18px] mr-1" aria-hidden="true">search</span>
                  <input
                    type="text"
                    aria-label="Search payee, expense item, or voucher code"
                    placeholder="Search payee or item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none w-full"
                  />
                </div>

                <select
                  value={categoryFilter}
                  aria-label="Filter expenses by category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-surface-container-low px-space-sm py-1.5 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Venue">Venue &amp; Lodging</option>
                  <option value="Catering">Catering &amp; Hospitality</option>
                  <option value="Decor">Decor &amp; Production</option>
                  <option value="Photography">Photography</option>
                  <option value="Stationery">Stationery</option>
                </select>

                <select
                  value={statusFilter}
                  aria-label="Filter expenses by milestone status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-surface-container-low px-space-sm py-1.5 rounded-xl font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="All">All Milestones</option>
                  <option value="Settled">Settled</option>
                  <option value="Tranche Due">Tranche Due</option>
                  <option value="Pending Invoice">Pending Invoice</option>
                </select>
              </div>
            </div>

            {/* Audit Stream List / Ledger */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-body-sm" aria-label="Expense Transaction Stream and Audit Trail">
                <thead className="bg-surface-container-low text-outline font-label-sm uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-space-sm px-space-md">Voucher Date</th>
                    <th scope="col" className="py-space-sm px-space-sm">Item &amp; Scope</th>
                    <th scope="col" className="py-space-sm px-space-sm">Vendor</th>
                    <th scope="col" className="py-space-sm px-space-sm">Category</th>
                    <th scope="col" className="py-space-sm px-space-sm">Invoiced</th>
                    <th scope="col" className="py-space-sm px-space-sm">Milestone</th>
                    <th scope="col" className="py-space-sm px-space-sm">Receipt</th>
                    <th scope="col" className="py-space-sm px-space-md text-right">Reconcile</th>
                  </tr>
                </thead>
              <tbody className="text-on-surface">
                {filteredExpenses.map((exp, idx) => {
                  const isSettled = exp.paymentStatus === 'settled';
                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-surface-container-low transition-colors ${
                        idx % 2 === 1 ? 'bg-surface-container-low/30' : ''
                      }`}
                    >
                      <td className="py-space-md px-space-md font-mono text-outline">{exp.expenseDate}</td>
                      <td className="py-space-md px-space-sm">
                        <div className="font-title-md text-title-md text-primary">{exp.description}</div>
                        <div className="font-label-sm text-label-sm text-outline">
                          {exp.voucherCode} • {exp.paymentMethod}
                        </div>
                      </td>
                      <td className="py-space-md px-space-sm font-medium">{exp.vendorName}</td>
                      <td className="py-space-md px-space-sm">
                        <span className="bg-surface-container-high px-2 py-0.5 rounded font-label-sm text-label-sm">
                          {exp.categoryName}
                        </span>
                      </td>
                      <td className="py-space-md px-space-sm font-bold text-primary">
                        ₹{exp.actualAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-space-md px-space-sm">
                        <span
                          className={`font-semibold flex items-center gap-1 font-label-sm ${
                            isSettled ? 'text-tertiary' : 'text-secondary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isSettled ? 'check_circle' : 'pending'}
                          </span>
                          {isSettled ? 'Settled' : 'Drawdown 1/3'}
                        </span>
                      </td>
                      <td className="py-space-md px-space-sm">
                        <span className="text-secondary flex items-center gap-1 font-label-sm">
                          <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                          {exp.receiptRef || 'PDF-402'}
                        </span>
                      </td>
                      <td className="py-space-md px-space-md text-right flex items-center justify-end gap-1">
                        <button
                          className="px-space-xs py-1 rounded bg-surface-container-high text-primary hover:bg-surface-container-highest font-label-sm text-label-sm font-semibold transition-colors cursor-pointer"
                          type="button"
                        >
                          Verified
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          title="Delete expense"
                          className="p-1 rounded text-outline hover:text-error transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination & Summary Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-space-xs text-outline font-label-sm border-t border-outline-variant/20">
            <span>Showing {filteredExpenses.length} of {expenses.length} validated vouchers</span>
            <div className="flex items-center gap-1">
              <button
                className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface disabled:opacity-50 cursor-pointer"
                disabled
                type="button"
              >
                Previous
              </button>
              <span className="px-2 font-medium text-primary">1</span>
              <button
                className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface cursor-pointer"
                type="button"
              >
                2
              </button>
              <button
                className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface cursor-pointer"
                type="button"
              >
                3
              </button>
              <button
                className="px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface cursor-pointer"
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
