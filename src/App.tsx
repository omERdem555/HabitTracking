import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { loadState, saveState, defaultState } from './lib/storage';
import { getStreak, getLongestStreak, getTotalCompletions, getHabitStats } from './lib/stats';
import { groupByDate, normalizeCompletions } from './lib/completion';
import { localDateString} from './lib/date';
import { buildYearSummaries, getDayBackground } from './lib/heatmap';

import reducer from './reducers/appReducer';

import type { Habit, Completion } from './types';

/* components */
import CompletionModal from './components/CompletionModal';
import DayDetailsModal from './components/DayDetailsModal';
import HabitCard from './components/HabitCard';
import EditHabitModal from './components/EditHabitModal';
import InstallPrompt from './components/InstallPrompt';
import SettingsModal from './components/SettingsModal';
import SummaryCards from './components/SummaryCards';
import UndoModal from './components/UndoModal';
import YearHeatmap from './components/YearHeatmap';
import Navbar from './components/Navbar';
import AddHabitForm from './components/AddHabitForm';

/* hooks */
import useNotifications from './hooks/useNotifications';
import useTheme from './hooks/useTheme';

/* constants */
const HABIT_COLOR = '#60a5fa';

/* ================= APP ================= */

function App() {
  const { t, i18n } = useTranslation();

  const [state, dispatch] = useReducer(reducer, defaultState);

  const { theme, toggleTheme } = useTheme();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [completionModal, setCompletionModal] = useState<any>(null);
  const [completionHours, setCompletionHours] = useState('');
  const [completionNote, setCompletionNote] = useState('');

  const [undoModal, setUndoModal] = useState<any>(null);

  const [expandedCompletions, setExpandedCompletions] = useState<Set<string>>(new Set());

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone;

  /* ================= EFFECTS ================= */

  useEffect(() => {
    dispatch({ type: 'load', payload: loadState() });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  /* PWA install prompt */
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    //if (!isMobile || isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  /* ================= DERIVED ================= */

  const today = localDateString();

  const completionSet = useMemo(
    () =>
      new Set(
        normalizeCompletions(state.completions).map(
          (c) => `${c.habitId}|${c.date}`,
        ),
      ),
    [state.completions],
  );

  const completionsByDate = useMemo(
    () => groupByDate(normalizeCompletions(state.completions)),
    [state.completions],
  );

  const habitsById = useMemo(
    () => Object.fromEntries(state.habits.map((h) => [h.id, h])),
    [state.habits],
  );

  const activeHabits = useMemo(
    () => state.habits.filter((h) => h.active),
    [state.habits],
  );

  const totalCompletedToday = useMemo(
    () =>
      activeHabits.filter((h) =>
        completionSet.has(`${h.id}|${today}`),
      ).length,
    [activeHabits, completionSet, today],
  );

  const stats = useMemo(
    () => ({
      longestStreak: getLongestStreak(state.habits, state.completions),
      totalCompletions: getTotalCompletions(state.completions),
      habitStats: getHabitStats(state.habits, state.completions),
    }),
    [state.habits, state.completions],
  );

  const legacyYears = useMemo(() => {
    const years = new Set<number>();
    const now = new Date();

    years.add(now.getFullYear());

    state.completions.forEach((c) => {
      years.add(new Date(`${c.date}T00:00:00`).getFullYear());
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [state.completions]);

  const yearSummary = useMemo(
    () =>
      buildYearSummaries(
        legacyYears,
        completionsByDate,
        habitsById,
        activeHabits.length,
      ),
    [legacyYears, completionsByDate, habitsById, activeHabits.length],
  );

  const selectedDayItems = useMemo(() => {
    if (!selectedDay) return [];

    const items = completionsByDate[selectedDay] ?? [];

    const grouped = items.reduce<Record<string, Completion[]>>(
      (acc, item) => {
        (acc[item.habitId] ??= []).push(item);
        return acc;
      },
      {},
    );

    return Object.entries(grouped).map(([habitId, entries]) => ({
      habitId,
      entries,
    }));
  }, [selectedDay, completionsByDate]);

  const undoCompletions = useMemo(() => {
    if (!undoModal) return [];

    const target = undoModal.date;

    return normalizeCompletions(state.completions).filter(
      (c) =>
        c.habitId === undoModal.habitId && c.date === target,
    );
  }, [undoModal, state.completions]);

  /* ================= NOTIFICATIONS ================= */

  useNotifications({
    enabled: state.notificationSettings.enabled,
    settings: state.notificationSettings,
    habits: state.habits,
    completions: state.completions,
    language: i18n.language,
    isStandalone
  });


  /* ================= HANDLERS ================= */

  const handleMarkToday = (habit: Habit) =>
    setCompletionModal({ habitId: habit.id, date: today });

  const handleOpenUndo = (habit: Habit) =>
    setUndoModal({ habitId: habit.id, date: today });

  const handleSaveCompletion = () => {
    if (!completionModal) return;

    dispatch({
      type: 'addCompletion',
      payload: {
        habitId: completionModal.habitId,
        date: completionModal.date,
        hours: completionHours ? Number(completionHours) : undefined,
        note: completionNote || undefined,
      },
    });

    setCompletionModal(null);
  };

  const handleRemoveCompletion = (id: string) =>
    dispatch({ type: 'removeCompletion', payload: { completionId: id } });

  const toggleCompletionDetails = (habitId: string, date: string) => {
    const key = `${habitId}-${date}`;

    setExpandedCompletions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;

    (installPromptEvent as any).prompt();
    const res = await (installPromptEvent as any).userChoice;

    if (res.outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setInstallPromptEvent(null);
  };




  const handleSaveSettings = async () => {
    if (state.notificationSettings.enabled) {

      if (!('Notification' in window)) {
        alert('Notifications not supported');
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        alert(
          i18n.language === 'tr'
            ? 'Bildirim izni verilmedi.'
            : 'Notification permission denied.'
        );

        return;
      }
    }

    setSettingsOpen(false);
  };

  const completionFieldStyle = {
    width: '100%',
    padding: '0.95rem 1rem',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  };

  const handleAddHabit = (name: string, color: string) => {
    dispatch({
      type: 'addHabit',
      payload: { name, color },
    });
  };

  /* ================= RENDER ================= */

  return (
    <div className="app-shell">
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        i18n={i18n}
        openSettings={() => setSettingsOpen(true)}
      />

      <header>
        <p>{t('subtitle')}</p>
      </header>

      <AddHabitForm onAdd={handleAddHabit} t={t} />

      <InstallPrompt
        showInstallPrompt={showInstallPrompt}
        handleInstallApp={handleInstallApp}
        setShowInstallPrompt={setShowInstallPrompt}
      />

      <SummaryCards
        activeHabitsLength={activeHabits.length}
        totalCompletedToday={totalCompletedToday}
        longestStreak={stats.longestStreak}
        totalCompletions={stats.totalCompletions}
      />

      <YearHeatmap
        yearSummary={yearSummary}
        activeHabitsLength={activeHabits.length}
        today={today}
        setSelectedDay={setSelectedDay}
        getDayBackground={getDayBackground}
      />

      <section className="card">
        {state.habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            completions={state.completions}
            completionSet={completionSet}
            today={today}
            streak={getStreak(habit.id, completionSet)}
            stats={stats}
            t={t}
            handleMarkToday={handleMarkToday}
            handleOpenUndo={handleOpenUndo}
            setEditingId={setEditingId}
            setEditingName={setEditingName}
            dispatch={dispatch}
          />
        ))}
      </section>

      <SettingsModal
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        state={state}
        dispatch={dispatch}
        handleSaveSettings={handleSaveSettings}
      />

      <DayDetailsModal
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedDayItems={selectedDayItems}
        habits={state.habits}
        expandedCompletions={expandedCompletions}
        toggleCompletionDetails={toggleCompletionDetails}
        theme={theme}
        t={t}
      />

      <UndoModal
        undoModal={undoModal}
        setUndoModal={setUndoModal}
        state={state}
        undoCompletions={undoCompletions}
        handleRemoveCompletion={handleRemoveCompletion}
      />

      <EditHabitModal
        editingId={editingId}
        editingName={editingName}
        setEditingId={setEditingId}
        setEditingName={setEditingName}
        t={t}
        onSave={() => {
          if (!editingId) return;

          dispatch({
            type: 'editHabit',
            payload: { id: editingId, name: editingName },
          });

          setEditingId(null);
        }}
      />

      <CompletionModal
        completionModal={completionModal}
        setCompletionModal={setCompletionModal}
        completionHours={completionHours}
        setCompletionHours={setCompletionHours}
        completionNote={completionNote}
        setCompletionNote={setCompletionNote}
        completionFieldStyle={completionFieldStyle}
        handleSaveCompletion={handleSaveCompletion}
        habits={state.habits}
        t={t}
      />
    </div>
  );
}

export default App;