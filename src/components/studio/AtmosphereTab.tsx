import React from 'react';
import { AIPlanVersion } from '../../../server/models/types.ts';

interface AtmosphereTabProps {
  currentPlan?: AIPlanVersion;
}

/**
 * Creative Direction, Aesthetic Swatches, Sensory Cues, and Signature Interactive Moments.
 */
export const AtmosphereTab: React.FC<AtmosphereTabProps> = ({ currentPlan }) => {
  const planData = currentPlan?.planJson;

  const personalizedIdeas = planData?.personalizedIdeas || [
    {
      title: 'Interactive Signature Moment',
      category: 'activity',
      description: 'Custom activity curated specifically for your guest count and location.',
      impact: 'High guest engagement and memorable storytelling.',
    },
  ];

  return (
    <div id="panel-ideas" role="tabpanel" aria-labelledby="tab-ideas" className="space-y-space-lg">
      <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 space-y-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
              Creative Concept &amp; Story
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">{currentPlan?.curationConcept}</h2>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-high px-3 py-1 rounded-full self-start">
            <span className="material-symbols-outlined text-secondary text-[16px]">stars</span>
            <span className="text-xs font-semibold text-primary">
              Score {planData?.aestheticFeasibilityScore || 96}%
            </span>
          </div>
        </div>

        {/* 4 Signature Interactive Moments */}
        <div className="pt-space-xs">
          <h3 className="font-title-md text-title-md text-primary font-semibold mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">auto_awesome</span>
            Personalized Signature Moments &amp; Activities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {personalizedIdeas.map((idea, idx) => (
              <div key={idx} className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                    {idea.category.replace('_', ' ')}
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">sparkles</span>
                </div>
                <h4 className="font-title-md text-title-md text-primary font-semibold">{idea.title}</h4>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">{idea.description}</p>
                <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-1.5 text-xs text-tertiary font-medium">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                  <span>{idea.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Palette Harmonizer */}
        <div className="pt-space-sm space-y-space-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-title-md text-title-md text-primary font-semibold">Harmonic Color Palette</h4>
            <span className="text-xs text-outline">Material Applications</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
            {(planData?.colorPalette || []).map((col, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-container-low space-y-2 border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg shadow-sm border border-black/10" style={{ backgroundColor: col.hex }}></div>
                  <span className="font-mono text-xs text-outline">{col.hex}</span>
                </div>
                <div>
                  <p className="font-title-sm text-xs font-bold text-primary truncate">{col.name}</p>
                  <p className="text-[11px] text-on-surface-variant truncate">{col.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spatial & Sensory Atmosphere */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
          <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/20">
            <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-semibold">
              <span className="material-symbols-outlined text-[20px] text-secondary">light_mode</span>
              <span>Lighting &amp; Spatial Architecture</span>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {planData?.spatialBlueprint?.lightingArchitecture}
            </p>
          </div>
          <div className="p-space-md rounded-xl bg-surface-container-low space-y-space-xs border border-outline-variant/20">
            <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-semibold">
              <span className="material-symbols-outlined text-[20px] text-secondary">spa</span>
              <span>Sensory &amp; Acoustic Atmosphere</span>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              {planData?.spatialBlueprint?.olfactoryTactileSignature}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
