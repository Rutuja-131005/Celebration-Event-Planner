import React, { useState, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { CreateEventModal } from './components/CreateEventModal.tsx';
import { AddExpenseModal } from './components/AddExpenseModal.tsx';
import { AddTaskModal } from './components/AddTaskModal.tsx';
import { AddQuoteModal } from './components/AddQuoteModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';

import { Overview } from './pages/Overview.tsx';
import { BudgetForecast } from './pages/BudgetForecast.tsx';

// Route-level Code Splitting for secondary and heavy pages
const AIPlanningStudio = React.lazy(() =>
  import('./pages/AIPlanningStudio.tsx').then((m) => ({ default: m.AIPlanningStudio }))
);
const VendorsQuotations = React.lazy(() =>
  import('./pages/VendorsQuotations.tsx').then((m) => ({ default: m.VendorsQuotations }))
);
const TimelineTasks = React.lazy(() =>
  import('./pages/TimelineTasks.tsx').then((m) => ({ default: m.TimelineTasks }))
);
const MyEvents = React.lazy(() =>
  import('./pages/MyEvents.tsx').then((m) => ({ default: m.MyEvents }))
);
const IdeasInspiration = React.lazy(() =>
  import('./pages/IdeasInspiration.tsx').then((m) => ({ default: m.IdeasInspiration }))
);
const ReportsInsights = React.lazy(() =>
  import('./pages/ReportsInsights.tsx').then((m) => ({ default: m.ReportsInsights }))
);
const Settings = React.lazy(() =>
  import('./pages/Settings.tsx').then((m) => ({ default: m.Settings }))
);

function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="p-16 flex flex-col items-center justify-center min-h-[400px] text-center"
    >
      <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-stone-300 font-serif text-lg tracking-wide">Loading Atelier Studio...</p>
      <p className="text-xs text-stone-500 mt-1">Synchronizing celebratory intelligence & assets</p>
    </div>
  );
}

import { eventsService } from './services/events.ts';
import { budgetService } from './services/budget.ts';
import { tasksService } from './services/tasks.ts';
import { vendorsService } from './services/vendors.ts';
import { planningService } from './services/planning.ts';
import { predictionsService } from './services/predictions.ts';
import { authService } from './services/auth.ts';

import {
  Event,
  BudgetCategory,
  Expense,
  Task,
  Vendor,
  VendorQuote,
  AIPlanVersion,
  Prediction,
  User,
  BudgetMetrics,
} from '../server/models/types.ts';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('overview');
  const [activeEventId, setActiveEventId] = useState<string>('evt_ananya_rohan');

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [budgetMetrics, setBudgetMetrics] = useState<BudgetMetrics | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [quotes, setQuotes] = useState<VendorQuote[]>([]);
  const [plans, setPlans] = useState<AIPlanVersion[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeEventId) {
      loadEventData(activeEventId);
    }
  }, [activeEventId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Fetch user profile, or bootstrap default lead planner session
      let userRes = await authService.getMe().catch(() => null);
      if (!userRes?.user) {
        try {
          const loginRes = await authService.login('rutuja@atelier.com', 'atelier2025').catch(() =>
            authService.login('priya@atelier.com', 'atelier2025')
          );
          if (loginRes?.user) {
            userRes = { success: true, user: loginRes.user };
          }
        } catch {
          // session fallback handled by api client
        }
      }
      if (userRes?.user) setCurrentUser(userRes.user);

      // Fetch all celebrations
      const eventsRes = await eventsService.getEvents();
      if (eventsRes?.events?.length) {
        setAllEvents(eventsRes.events);
        const current = eventsRes.events.find((e) => e.id === activeEventId) || eventsRes.events[0];
        setActiveEvent(current);
        setActiveEventId(current.id);
        await loadEventData(current.id);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async (eventId: string) => {
    try {
      const [bRes, expRes, tRes, vRes, qRes, pRes, predRes] = await Promise.all([
        budgetService.getBudget(eventId).catch(() => ({ metrics: null, categories: [] })),
        budgetService.getExpenses(eventId).catch(() => ({ expenses: [] })),
        tasksService.getTasks(eventId).catch(() => ({ tasks: [] })),
        vendorsService.getVendors(eventId).catch(() => ({ vendors: [] })),
        vendorsService.getQuotes(eventId).catch(() => ({ quotes: [] })),
        planningService.getPlans(eventId).catch(() => ({ plans: [] })),
        predictionsService.getLatestPrediction(eventId).catch(() => ({ prediction: null })),
      ]);

      setBudgetMetrics(bRes.metrics);
      setCategories(bRes.categories || []);
      setExpenses(expRes.expenses || []);
      setTasks(tRes.tasks || []);
      setVendors(vRes.vendors || []);
      setQuotes(qRes.quotes || []);
      setPlans(pRes.plans || []);
      setPrediction(predRes.prediction || null);

      // Also ensure activeEvent is in sync
      const matched = allEvents.find((e) => e.id === eventId);
      if (matched) setActiveEvent(matched);
    } catch (err) {
      console.error('Event data refresh error:', err);
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setActiveEventId(eventId);
    const ev = allEvents.find((e) => e.id === eventId);
    if (ev) setActiveEvent(ev);
  };

  const handleEventCreated = async (newEvent: Event, planGenerated?: boolean) => {
    setAllEvents((prev) => [newEvent, ...prev]);
    setActiveEvent(newEvent);
    setActiveEventId(newEvent.id);
    await loadEventData(newEvent.id);
    if (planGenerated) {
      setCurrentPath('ai-planning-studio');
    } else {
      setCurrentPath('overview');
    }
  };

  const handleExpenseAdded = (newExpense: Expense, updatedMetrics?: BudgetMetrics) => {
    setExpenses((prev) => [newExpense, ...prev]);
    if (updatedMetrics) {
      setBudgetMetrics(updatedMetrics);
    } else {
      loadEventData(activeEventId);
    }
  };

  const handleTaskAdded = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleQuoteAdded = (newQuote: VendorQuote) => {
    setQuotes((prev) => [newQuote, ...prev]);
  };

  if (loading && !activeEvent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary-container border-t-primary animate-spin"></div>
        <p className="font-headline-sm text-headline-sm text-primary">Opening Atelier Portfolio...</p>
        <span className="font-body-sm text-outline">Loading verified records &amp; computational models</span>
      </div>
    );
  }

  const fallbackEvent: Event = {
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
    eventPreferences: {},
    status: 'in_progress',
    daysRemaining: 42,
    readinessScore: 84,
    code: 'ATELIER-2025-UDR',
    createdAt: '2025-03-12T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  const eventToRender = activeEvent || fallbackEvent;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-on-surface antialiased">
        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-[280px] focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-secondary font-semibold text-sm transition-all"
        >
          Skip to main content
        </a>

        {/* Fixed Sidebar */}
        <Sidebar
          currentPath={currentPath}
          onNavigate={setCurrentPath}
          onCreateEventClick={() => setIsCreateEventOpen(true)}
          activeEventsCount={allEvents.length || 5}
        />

        {/* Main Container offset by sidebar width */}
        <div className="pl-[260px]">
          {/* Fixed Header */}
          <Header
            currentPath={currentPath}
            activeEvent={eventToRender}
            allEvents={allEvents}
            onSelectEvent={handleSelectEvent}
            currentUser={currentUser}
            onNavigate={setCurrentPath}
            onOpenAuth={() => setIsAuthOpen(true)}
            onCreateEventClick={() => setIsCreateEventOpen(true)}
          />

          {/* Viewport Content Area with accessible landmark */}
          <main
            id="main-content"
            tabIndex={-1}
            aria-label="Main Application Content"
            className="relative pt-16 bg-background min-h-screen focus:outline-none"
          >
            <React.Suspense fallback={<PageLoadingFallback />}>
              {currentPath === 'overview' && (
                <Overview
                  event={eventToRender}
                  tasks={tasks}
                  quotes={quotes}
                  prediction={prediction}
                  currentUser={currentUser}
                  onNavigate={setCurrentPath}
                  onOpenAddTask={() => setIsAddTaskOpen(true)}
                  onRefreshData={() => loadEventData(activeEventId)}
                />
              )}

              {currentPath === 'budget-and-forecast' && (
                <BudgetForecast
                  eventId={activeEventId}
                  categories={categories}
                  expenses={expenses}
                  metrics={budgetMetrics}
                  onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                  onRefreshData={() => loadEventData(activeEventId)}
                />
              )}

              {currentPath === 'ai-planning-studio' && (
                <AIPlanningStudio
                  event={eventToRender}
                  plans={plans}
                  onRefreshPlans={() => loadEventData(activeEventId)}
                  onEventUpdated={(updated) => {
                    setActiveEvent(updated);
                    setAllEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
                    loadEventData(updated.id);
                  }}
                  onNavigateTab={setCurrentPath}
                />
              )}

              {currentPath === 'vendors-and-quotations' && (
                <VendorsQuotations
                  event={eventToRender}
                  vendors={vendors}
                  quotes={quotes}
                  onOpenAddQuote={() => setIsAddQuoteOpen(true)}
                  onRefreshData={() => loadEventData(activeEventId)}
                />
              )}

              {currentPath === 'timeline-and-tasks' && (
                <TimelineTasks
                  event={eventToRender}
                  tasks={tasks}
                  onOpenAddTask={() => setIsAddTaskOpen(true)}
                  onRefreshTasks={() => loadEventData(activeEventId)}
                />
              )}

              {currentPath === 'my-events' && (
                <MyEvents
                  events={allEvents}
                  activeEventId={activeEventId}
                  onSelectEvent={handleSelectEvent}
                  onOpenCreateEvent={() => setIsCreateEventOpen(true)}
                />
              )}

              {currentPath === 'ideas-and-inspiration' && <IdeasInspiration />}

              {currentPath === 'reports-and-insights' && (
                <ReportsInsights
                  event={eventToRender}
                  prediction={prediction}
                  metrics={budgetMetrics}
                />
              )}

              {currentPath === 'settings' && (
                <Settings
                  currentUser={currentUser}
                  onOpenAuth={() => setIsAuthOpen(true)}
                />
              )}
            </React.Suspense>
          </main>
      </div>

      {/* Interactive Modals */}
      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onEventCreated={handleEventCreated}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        eventId={activeEventId}
        categories={categories}
        onClose={() => setIsAddExpenseOpen(false)}
        onExpenseAdded={handleExpenseAdded}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        eventId={activeEventId}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskAdded={handleTaskAdded}
      />

      <AddQuoteModal
        isOpen={isAddQuoteOpen}
        eventId={activeEventId}
        onClose={() => setIsAddQuoteOpen(false)}
        onQuoteAdded={handleQuoteAdded}
      />

      <AuthModal
        isOpen={isAuthOpen}
        currentUser={currentUser}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(usr) => setCurrentUser(usr)}
        onLogout={() => {
          authService.logout();
          setCurrentUser(null);
        }}
      />
      </div>
    </MotionConfig>
  );
}
