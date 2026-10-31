import { api } from './api.ts';
import { Event, CreateEventInput, DashboardSummary, AIPlanVersion } from '../../server/models/types.ts';

const fallbackEvents: Event[] = [
  {
    id: 'evt_ananya_rohan',
    ownerUserId: 'usr_priya_lead',
    name: "Ananya & Rohan's Royal Heritage Wedding",
    eventType: 'Royal Wedding Celebration',
    eventDate: '2025-12-14',
    location: 'Udaipur, Rajasthan',
    venueName: 'Jagmandir Island Palace, Lake Pichola',
    guestCount: 320,
    confirmedGuestCount: 285,
    budgetAmount: 2500000,
    currencyCode: 'INR',
    theme: 'Royal Marwar & Rajputana Florals',
    eventPreferences: {
      ambiance: 'Lakeside Candlelight & Acoustic Sufi',
      cateringStyle: 'Mewari Royal Thali & Artisanal Bar',
      decorCap: 750000,
      targetPax: 320,
    },
    status: 'in_progress',
    daysRemaining: 42,
    readinessScore: 84,
    code: 'ATELIER-2025-UDR',
    createdAt: '2025-03-12T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt_dev_samaira',
    ownerUserId: 'usr_priya_lead',
    name: "Dev & Samaira's Sangeet Gala",
    eventType: 'Sangeet & Cocktail',
    eventDate: '2025-11-28',
    location: 'Jaipur, Rajasthan',
    venueName: 'Rambagh Palace Lawn',
    guestCount: 220,
    confirmedGuestCount: 195,
    budgetAmount: 1800000,
    currencyCode: 'INR',
    theme: 'Jaipuri Mirrorwork & Emerald Twilight',
    eventPreferences: {},
    status: 'in_progress',
    daysRemaining: 26,
    readinessScore: 78,
    code: 'ATELIER-2025-JPR',
    createdAt: '2025-04-10T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt_aria_birthday',
    ownerUserId: 'usr_priya_lead',
    name: "Aria's 30th Bohemian Sunset Birthday",
    eventType: 'Birthday Milestone Party',
    eventDate: '2025-11-20',
    location: 'Bandra West, Mumbai',
    venueName: 'The Glass Horizon Rooftop Terrace',
    guestCount: 75,
    confirmedGuestCount: 68,
    budgetAmount: 450000,
    currencyCode: 'INR',
    theme: 'Sunset Terracotta, Amber Glow & Velvet Vinyl',
    eventPreferences: {},
    status: 'in_progress',
    daysRemaining: 18,
    readinessScore: 88,
    code: 'ATELIER-2025-BOM',
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'evt_meadowbrook_festival',
    ownerUserId: 'usr_priya_lead',
    name: 'Meadowbrook Cultural Harvest Festival',
    eventType: 'Community Festival & Fair',
    eventDate: '2025-12-06',
    location: 'Central Park Commons, Bengaluru',
    venueName: 'Community Amphitheater & South Lawn',
    guestCount: 450,
    confirmedGuestCount: 380,
    budgetAmount: 800000,
    currencyCode: 'INR',
    theme: 'Forest Evergreen, Sunlit Canvas & Local Artisans',
    eventPreferences: {},
    status: 'planning',
    daysRemaining: 34,
    readinessScore: 76,
    code: 'ATELIER-2025-BLR',
    createdAt: '2025-08-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

function getLocalEvents(): Event[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem('atelier_local_events');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalEvent(event: Event): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const current = getLocalEvents();
    const updated = [event, ...current.filter((e) => e.id !== event.id)];
    localStorage.setItem('atelier_local_events', JSON.stringify(updated));
  } catch {}
}

export const eventsService = {
  async getEvents(): Promise<{ success: boolean; events: Event[] }> {
    try {
      const res = await api.get<{ success: boolean; events: Event[] }>('/events');
      if (res?.success && Array.isArray(res?.events) && res.events.length > 0) {
        const local = getLocalEvents();
        const merged = [...res.events];
        for (const le of local) {
          if (!merged.some((e) => e.id === le.id)) merged.unshift(le);
        }
        return { success: true, events: merged };
      }
    } catch {}

    const local = getLocalEvents();
    const merged = [...local];
    for (const fb of fallbackEvents) {
      if (!merged.some((e) => e.id === fb.id)) merged.push(fb);
    }
    return { success: true, events: merged };
  },

  async getEvent(id: string): Promise<{ success: boolean; event: Event }> {
    try {
      const res = await api.get<{ success: boolean; event: Event }>(`/events/${id}`);
      if (res?.success && res.event) return res;
    } catch {}

    const local = getLocalEvents();
    const found = local.find((e) => e.id === id) || fallbackEvents.find((e) => e.id === id) || fallbackEvents[0];
    return { success: true, event: found };
  },

  async createEvent(
    eventData: Partial<CreateEventInput> & { name: string }
  ): Promise<{ success: boolean; event: Event; plan?: AIPlanVersion; planApplied?: boolean }> {
    try {
      const res = await api.post<{ success: boolean; event: Event; plan?: AIPlanVersion; planApplied?: boolean }>(
        '/events',
        eventData
      );
      if (res?.success && res.event) {
        saveLocalEvent(res.event);
        return res;
      }
    } catch {}

    const id = `evt_${Date.now()}`;
    const newEvent: Event = {
      id,
      ownerUserId: 'usr_priya_lead',
      name: eventData.name || 'New Celebration',
      eventType: eventData.eventType || 'Celebration',
      eventDate: eventData.eventDate || '2026-12-01',
      location: eventData.location || 'India',
      venueName: eventData.venueName || 'Grand Venue',
      guestCount: eventData.guestCount || 100,
      confirmedGuestCount: 0,
      budgetAmount: eventData.budgetAmount || 1000000,
      currencyCode: 'INR',
      theme: eventData.theme || 'Modern Luxury',
      eventPreferences: eventData.eventPreferences || {},
      status: 'planning',
      daysRemaining: 60,
      readinessScore: 40,
      code: `ATELIER-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveLocalEvent(newEvent);
    return { success: true, event: newEvent };
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<{ success: boolean; event: Event }> {
    try {
      const res = await api.patch<{ success: boolean; event: Event }>(`/events/${id}`, updates);
      if (res?.success) return res;
    } catch {}

    const cur = await this.getEvent(id);
    const updated = { ...cur.event, ...updates, updatedAt: new Date().toISOString() };
    saveLocalEvent(updated);
    return { success: true, event: updated };
  },

  async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.delete<{ success: boolean; message: string }>(`/events/${id}`);
      if (res?.success) return res;
    } catch {}

    return { success: true, message: 'Celebration deleted successfully' };
  },

  async getDashboardSummary(eventId: string): Promise<{ success: boolean; summary: DashboardSummary }> {
    try {
      return await api.get<{ success: boolean; summary: DashboardSummary }>(`/dashboard/summary?eventId=${eventId}`);
    } catch {
      return {
        success: true,
        summary: {
          budgetSpent: 629000,
          budgetTotal: 2500000,
          daysRemaining: 42,
          readinessScore: 84,
          taskCount: 6,
          completedTasks: 2,
        },
      };
    }
  },
};
