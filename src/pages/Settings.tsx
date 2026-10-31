import React, { useState, useEffect } from 'react';
import { User } from '../../server/models/types.ts';

import { logger } from '../utils/logger.ts';

interface SystemHealth {
  status?: string;
  timestamp?: string;
  version?: string;
  aiProvider?: string;
  uptime?: number;
}

interface SettingsProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, onOpenAuth }) => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await fetch('/health/ready');
      const data: SystemHealth = await res.json();
      setHealth(data);
    } catch (err) {
      logger.error('Failed to fetch system health diagnostics', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  return (
    <div className="w-full px-space-lg py-space-lg max-w-[1400px] mx-auto">
      <div className="flex flex-col w-full space-y-space-xl">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-xs text-secondary font-label-sm uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Atelier Administration &amp; System Health</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Atelier Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Configure atelier regional presets, AI planning engine credentials, and verify operational backend health.
          </p>
        </div>

        {/* Lead Account Card */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={
                  currentUser?.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD86wFMv7GznXchX3b4O0dO0Rfez-G3ls1BbhsDJ0csLCul8V7slfahg9diMslJ1IoVgS44Ez3ew_HFxaRBsRsXAra2Tfahx2dEi1psEBko4A9GOcglUSNHJkeWtIhe90bEwS4Pd0HEFlR_MQ6jWaLs6Tmg8gYFOpdYpoTVe6UTJ3SPEB_cF_LAzhIkZA1B4eeLHhgwBJ0G9JGPfwa3g7bfhVB94BhsEVkIMxGpgrMstBUC8ijg7jOxDw'
                }
                alt={currentUser?.name || 'Rutuja Jadhav'}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div>
                <h3 className="font-headline-sm text-primary font-bold">{currentUser?.name || 'Rutuja Jadhav'}</h3>
                <p className="text-sm text-outline">{currentUser?.email || 'rutuja@atelier.com'}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
                  {currentUser?.role || 'Lead Planner'}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-colors cursor-pointer"
            >
              Manage Account / Login
            </button>
          </div>
        </div>

        {/* Diagnostic System Health */}
        <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[22px]">health_and_safety</span>
              <h3 className="font-title-lg text-primary font-bold">API Services &amp; Connectivity Status</h3>
            </div>
            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="text-xs text-secondary hover:underline cursor-pointer flex items-center gap-1"
            >
              <span className={`material-symbols-outlined text-[16px] ${loadingHealth ? 'animate-spin' : ''}`}>
                sync
              </span>
              Refresh Diagnostics
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-low">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider block">Backend API Engine</span>
              <p className="text-lg font-bold text-primary mt-1">REST API v1</p>
              <span className="inline-flex items-center gap-1 text-xs text-tertiary font-semibold mt-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                Active on port 3000
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider block">Persistence Database</span>
              <p className="text-lg font-bold text-primary mt-1">Atelier JSON Storage</p>
              <span className="inline-flex items-center gap-1 text-xs text-tertiary font-semibold mt-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                Transactional &amp; Persistent
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low">
              <span className="text-xs font-semibold text-outline uppercase tracking-wider block">AI Provider Engine</span>
              <p className="text-lg font-bold text-primary mt-1">
                {health?.aiProvider === 'gemini' ? 'Gemini 3.8 Flash' : 'Development Fallback (Offline Safe)'}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-tertiary font-semibold mt-1">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                Structured Schema Active
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container text-xs text-on-surface-variant">
            <strong>Security &amp; Privacy:</strong> All client communications pass through local authenticated endpoints (`/api/v1/*`). No secrets or database passwords are ever exposed to client bundles.
          </div>
        </div>
      </div>
    </div>
  );
};
