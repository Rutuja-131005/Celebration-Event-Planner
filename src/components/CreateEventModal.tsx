import React, { useState } from 'react';
import { eventsService } from '../services/events.ts';
import { Event } from '../../server/models/types.ts';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('Royal Wedding Celebration');
  const [location, setLocation] = useState('Udaipur, Rajasthan');
  const [venueName, setVenueName] = useState('Jagmandir Island Palace');
  const [guestCount, setGuestCount] = useState(300);
  const [budgetAmount, setBudgetAmount] = useState(2500000);
  const [theme, setTheme] = useState('Royal Marwar & Rajputana Florals');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Celebration title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await eventsService.createEvent({
        name,
        eventType,
        location,
        venueName,
        guestCount: Number(guestCount),
        budgetAmount: Number(budgetAmount),
        theme,
      });

      if (res.success && res.event) {
        onEventCreated(res.event);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create celebration event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl border border-outline-variant/40 space-y-space-md">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">celebration</span>
            <h3 className="font-headline-sm text-headline-sm text-primary">Create New Celebration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-primary transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Celebration Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ananya & Rohan's Royal Heritage Wedding"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => {
                  const val = e.target.value;
                  setEventType(val);
                  if (val.includes('Birthday')) {
                    if (!name || name.includes('Wedding')) setName("Aria's 30th Bohemian Birthday");
                    setGuestCount(75);
                    setBudgetAmount(450000);
                    setLocation('Bandra West, Mumbai');
                    setVenueName('The Glass Horizon Rooftop');
                    setTheme('Sunset Terracotta, Amber Glow & Velvet Vinyl');
                  } else if (val.includes('Community')) {
                    if (!name || name.includes('Wedding')) setName('Meadowbrook Cultural Harvest Festival');
                    setGuestCount(450);
                    setBudgetAmount(800000);
                    setLocation('Central Park Commons, Bengaluru');
                    setVenueName('Community Amphitheater & South Lawn');
                    setTheme('Forest Evergreen, Sunlit Canvas & Local Artisans');
                  } else if (val.includes('Wedding')) {
                    if (!name || name.includes('Birthday')) setName("Ananya & Rohan's Royal Heritage Wedding");
                    setGuestCount(320);
                    setBudgetAmount(2500000);
                    setLocation('Udaipur, Rajasthan');
                    setVenueName('Jagmandir Island Palace');
                    setTheme('Royal Marwar & Rajputana Florals');
                  }
                }}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              >
                <option value="Wedding Celebration">Wedding Celebration</option>
                <option value="Birthday Milestone Party">Birthday Milestone Party</option>
                <option value="Community Festival & Gathering">Community Festival & Gathering</option>
                <option value="Charity Gala & Fundraiser">Charity Gala & Fundraiser</option>
                <option value="Engagement & Dinner">Engagement Soirée</option>
                <option value="Custom Atelier Event">Custom Atelier Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Guest Count
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Target Budget (₹ INR)
              </label>
              <input
                type="number"
                step="50000"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Destination / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Udaipur, Rajasthan"
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Venue Name
            </label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g. Jagmandir Island Palace, Lake Pichola"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Styling Theme & Palette
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Royal Marwar, Deep Plum & Terracotta"
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none text-sm"
            />
          </div>

          <div className="pt-space-sm flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Initialize Celebration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
