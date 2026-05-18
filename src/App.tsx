import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { loadState, saveState, defaultState } from './lib/storage';
import type { Action, AppState, Habit, Completion } from './types';

const HABIT_COLOR = '#60a5fa';

const localDateString = (date = new Date()): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const normalizeDate = (value: string): string => {
  const [year, month, day] = value.split('-').map(Number);
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

const normalizeCompletions = (completions: Completion[]) => {
  return completions.map((completion) => ({
    ...completion,
    date: normalizeDate(completion.date),
  }));
};

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'load':
      return action.payload;
    case 'addHabit': {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      return {
        ...state,
        habits: [
          {
            id,
            name: action.payload.name.trim(),
            color: action.payload.color,
            active: true,
            createdAt: localDateString(),
          },
          ...state.habits,
        ],
      };
    }
    case 'editHabit':
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload.id ? { ...habit, name: action.payload.name.trim() } : habit,
        ),
      };
    case 'toggleHabitActive':
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload.id
            ? {
                ...habit,
                active: !habit.active,
                archivedAt: habit.active ? localDateString() : undefined,
              }
            : habit,
        ),
      };
    case 'addCompletion': {
      const date = normalizeDate(action.payload.date);
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      return {
        ...state,
        completions: [
          ...state.completions,
          {
            id,
            habitId: action.payload.habitId,
            date,
            hours: action.payload.hours,
            note: action.payload.note,
          },
        ],
      };
    }
    case 'removeCompletion':
      return {
        ...state,
        completions: state.completions.filter(
          (completion) => completion.id !== action.payload.completionId,
        ),
      };
    default:
      return state;
  }
};

const groupByDate = (completions: Completion[]) => {
  return completions.reduce<Record<string, Completion[]>>((acc, completion) => {
    const date = normalizeDate(completion.date);
    acc[date] = acc[date] ? [...acc[date], completion] : [completion];
    return acc;
  }, {});
};

const getPreviousDate = (dateString: string): string => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return localDateString(date);
};

const getYearDays = (year: number) => {
  const days: string[] = [];
  const start = new Date(`${year}-01-01T00:00:00`);
  const end = new Date(`${year}-12-31T00:00:00`);
  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    days.push(normalizeDate(current.toISOString().slice(0, 10)));
  }
  return days;
};

const getStreak = (habitId: string, completionSet: Set<string>) => {
  let streak = 0;
  let cursor = localDateString();
  while (completionSet.has(`${habitId}|${cursor}`)) {
    streak += 1;
    cursor = getPreviousDate(cursor);
  }
  return streak;
};

const getDayBackground = (count: number, total: number) => {
  if (count === 0) return 'rgba(226, 232, 255, 0.18)';
  const progress = Math.min(count / Math.max(total, 1), 1);
  const alpha = 0.25 + progress * 0.55;
  return `rgba(96, 165, 250, ${alpha.toFixed(2)})`;
};

const buildYearSummaries = (
  years: number[],
  completionMap: Record<string, Completion[]>,
  habitsById: Record<string, Habit | undefined>,
  activeHabitCount: number,
) => {
  return years.map((year) => {
    const days = getYearDays(year);
    return {
      year,
      days: days.map((day) => {
        const dayCompletions = completionMap[day] ?? [];
        const uniqueHabitIds = Array.from(new Set(dayCompletions.map((item) => item.habitId)));
        const activeCompletedCount = new Set(
          dayCompletions.filter((item) => habitsById[item.habitId]?.active).map((item) => item.habitId),
        ).size;
        const allComplete = activeHabitCount > 0 && activeCompletedCount >= activeHabitCount;
        return {
          day,
          count: uniqueHabitIds.length,
          allComplete,
        };
      }),
    };
  });
};

function App() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState(HABIT_COLOR);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [completionModal, setCompletionModal] = useState<{ habitId: string; date: string } | null>(null);
  const [completionHours, setCompletionHours] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [undoModal, setUndoModal] = useState<{ habitId: string; date: string } | null>(null);
  const [expandedCompletions, setExpandedCompletions] = useState<Set<string>>(new Set());
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    dispatch({ type: 'load', payload: loadState() });
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    const isMobile = window.innerWidth <= 768;

    if (!isMobile || isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const today = localDateString();
  const completionSet = useMemo(() => {
    return new Set(normalizeCompletions(state.completions).map((item) => `${item.habitId}|${item.date}`));
  }, [state.completions]);

  const completionsByDate = useMemo(
    () => groupByDate(normalizeCompletions(state.completions)),
    [state.completions],
  );

  const habitsById = useMemo(
    () => Object.fromEntries(state.habits.map((habit) => [habit.id, habit] as const)),
    [state.habits],
  );

  const activeHabits = useMemo(() => state.habits.filter((habit) => habit.active), [state.habits]);
  const totalCompletedToday = useMemo(
    () => activeHabits.filter((habit) => completionSet.has(`${habit.id}|${today}`)).length,
    [activeHabits, completionSet, today],
  );

  const legacyYears = useMemo(() => {
    const years = new Set<number>();
    const now = new Date();
    years.add(now.getFullYear());
    state.completions.forEach((completion) => {
      const year = new Date(`${completion.date}T00:00:00`).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [state.completions]);

  const yearSummary = useMemo(
    () => buildYearSummaries(legacyYears, completionsByDate, habitsById, activeHabits.length),
    [legacyYears, completionsByDate, habitsById, activeHabits.length],
  );

  const stats = useMemo(() => {
    const totalCompletions = state.completions.length;
    const longestStreak = state.habits.reduce((best, habit) => {
      const completions = state.completions
        .filter((c) => c.habitId === habit.id)
        .map((c) => normalizeDate(c.date));
      const uniqueSet = new Set(completions);
      let maxStreak = 0;
      let current = 0;
      const sortedDays = Array.from(uniqueSet).sort();
      for (let i = 0; i < sortedDays.length; i += 1) {
        if (i === 0) {
          current = 1;
        } else {
          const prev = getPreviousDate(sortedDays[i]);
          current = sortedDays[i - 1] === prev ? current + 1 : 1;
        }
        maxStreak = Math.max(maxStreak, current);
      }
      return Math.max(best, maxStreak);
    }, 0);

    // Weekly and monthly totals for each habit
    const habitStats = state.habits.map(habit => {
      const completions = state.completions.filter(c => c.habitId === habit.id);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentWeek = Math.floor((now.getDate() - now.getDay() + 1) / 7) + 1;

      const monthlyHours = completions
        .filter(c => {
          const date = new Date(c.date);
          return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        })
        .reduce((sum, c) => sum + (c.hours || 0), 0);

      const weeklyHours = completions
        .filter(c => {
          const date = new Date(c.date);
          const week = Math.floor((date.getDate() - date.getDay() + 1) / 7) + 1;
          return date.getFullYear() === currentYear && date.getMonth() === currentMonth && week === currentWeek;
        })
        .reduce((sum, c) => sum + (c.hours || 0), 0);

      return {
        habitId: habit.id,
        monthlyHours,
        weeklyHours
      };
    });

    return { totalCompletions, longestStreak, habitStats };
  }, [state.completions, state.habits]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDay) return [];
    const items = completionsByDate[selectedDay] ?? [];
    const grouped = items.reduce<Record<string, Completion[]>>((acc, item) => {
      if (!acc[item.habitId]) {
        acc[item.habitId] = [];
      }
      acc[item.habitId].push(item);
      return acc;
    }, {});
    return Object.entries(grouped).map(([habitId, entries]) => ({ habitId, entries }));
  }, [selectedDay, completionsByDate]);

  useEffect(() => {
    if (!selectedDay) return;
    setExpandedCompletions(
      new Set(selectedDayItems.map((item) => `${item.habitId}-${selectedDay}`)),
    );
  }, [selectedDay, selectedDayItems]);

  const undoCompletions = useMemo(() => {
    if (!undoModal) return [];
    const targetDate = normalizeDate(undoModal.date);
    return normalizeCompletions(state.completions).filter(
      (completion) => completion.habitId === undoModal.habitId && completion.date === targetDate,
    );
  }, [undoModal, state.completions]);

  useEffect(() => {
    if (undoModal && undoCompletions.length === 0) {
      setUndoModal(null);
    }
  }, [undoModal, undoCompletions.length]);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language === 'tr' ? 'tr' : 'en', { month: 'long' }),
    [i18n.language],
  );

  const handleAddHabit = () => {
    const name = habitName.trim();
    if (!name) return;
    dispatch({ type: 'addHabit', payload: { name, color: habitColor } });
    setHabitName('');
    setHabitColor(HABIT_COLOR);
  };

  const handleSaveCompletion = () => {
    if (completionModal) {
      const hours = completionHours ? parseFloat(completionHours) : undefined;
      dispatch({ type: 'addCompletion', payload: { habitId: completionModal.habitId, date: completionModal.date, hours, note: completionNote || undefined } });
      setCompletionModal(null);
    }
  };

  const toggleCompletionDetails = (habitId: string, date: string) => {
    const key = `${habitId}-${date}`;
    setExpandedCompletions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const completionFieldStyle = {
    width: '100%',
    padding: '0.95rem 1rem',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  };

  const handleMarkToday = (habit: Habit) => {
    setCompletionModal({ habitId: habit.id, date: today });
    setCompletionHours('');
    setCompletionNote('');
  };

  const handleOpenUndo = (habit: Habit) => {
    setUndoModal({ habitId: habit.id, date: today });
  };

  const handleRemoveCompletion = (completionId: string) => {
    dispatch({ type: 'removeCompletion', payload: { completionId } });
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;

    const promptEvent = installPromptEvent as any;
    promptEvent.prompt();

    const choiceResult = await promptEvent.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setShowInstallPrompt(false);
    }

    setInstallPromptEvent(null);
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="navbar-content">
          <h1 style={{ opacity: 0.9 }}>{t('title')}</h1>
          <div className="navbar-buttons">
            <button
              type="button"
              className="theme-button"
              onClick={toggleTheme}
            >
              {theme === 'light' ? t('dark') : t('light')}
            </button>
            <button
              type="button"
              className="lang-button"
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'tr' : 'en')}
            >
              {i18n.language === 'en' ? 'TR' : 'ENG'}
            </button>
          </div>
        </div>
      </nav>
      <header>
        <div>
          <p style={{ opacity: 0.9, marginTop: 8, maxWidth: 540, color: 'var(--text-secondary)' }}>
            {t('subtitle')}
          </p>
        </div>
      </header>

      {showInstallPrompt && (
        <section className="card" style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '320px',
            }}
          >

          <div>
            <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
              {i18n.language === 'tr'
                ? 'Bildirimler ve çevrimdışı kullanım için uygulamayı yükleyin'
                : 'Install app for reminders & offline use'}
            </strong>
          </div>


            <button
              type="button"
              onClick={handleInstallApp}
              style={{
                width: '100%',
                padding: '0.95rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--button-border)',
                background: 'var(--button-bg)',
                color: 'var(--button-text)',
              }}
            >
              {i18n.language === 'tr' ? 'Yükle' : 'Install'}
            </button>

            <button
              type="button"
              onClick={() => setShowInstallPrompt(false)}
              style={{
                width: '100%',
                padding: '0.95rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--button-border)',
                background: 'var(--button-bg)',
                color: 'var(--button-text)',
              }}
            >
              {i18n.language === 'tr' ? 'Kapat' : 'Close'}
            </button>
          </div>
        </section>
      )}

      <section className="card">
        <div className="form-row">
          <input
            value={habitName}
            onChange={(event) => setHabitName(event.target.value)}
            placeholder={t('addHabitPlaceholder')}
            aria-label={t('habitNamePlaceholder')}
          />
          <div className="form-actions">
            <button type="button" onClick={handleAddHabit}>
              {t('addButton')}
            </button>
            <input
              type="color"
              className="color-input"
              value={habitColor}
              onChange={(event) => setHabitColor(event.target.value)}
              aria-label={t('habitColor')}
            />
          </div>
        </div>
      </section>

      <section className="card habit-summary">
        <div className="summary-card">
          <h3>{t('activeHabits')}</h3>
          <p>{activeHabits.length}</p>
        </div>
        <div className="summary-card">
          <h3>{t('completedToday')}</h3>
          <p>{totalCompletedToday}</p>
        </div>
        <div className="summary-card">
          <h3>{t('longestStreak')}</h3>
          <p>{stats.longestStreak}</p>
        </div>
        <div className="summary-card">
          <h3>{t('totalCompletions')}</h3>
          <p>{stats.totalCompletions}</p>
        </div>
      </section>

      {yearSummary.length > 0 && (
        <section className="card calendar-grid">
          <h2 style={{ opacity: 0.85 }}>{t('calendarPerformance')}</h2>
          {yearSummary.map((yearRow) => (
            <div key={yearRow.year} className="year-row">
              <div className="day-label">{yearRow.year}</div>
              <div className="week-grid">
                {yearRow.days.map((day) => (
                  <button
                    key={day.day}
                    type="button"
                    className="day-cell"
                    style={{
                      background: getDayBackground(day.count, activeHabits.length),
                      boxShadow: day.allComplete
                        ? `0 0 0 2px rgba(96, 165, 250, 0.4), 0 0 15px rgba(96, 165, 250, 0.22)`
                        : day.day === today
                        ? '0 0 0 0.5px rgba(14, 165, 233, 0.55), 0 0 12px rgba(14, 165, 233, 0.16)'
                        : undefined,
                      borderColor: day.day === today ? '#0ea5e9' : 'rgba(148, 163, 184, 0.24)',
                    }}
                    onClick={() => setSelectedDay(day.day)}
                    aria-label={`${day.day}, ${day.count} completed habit${day.count !== 1 ? 's' : ''}`}
                    title={`${day.day} — ${day.count} completed habit${day.count !== 1 ? 's' : ''}`}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="habits card">
        <h2 style={{ opacity: 0.85 }}>{t('habits')}</h2>
        <div className="habit-list">
          {state.habits.length === 0 ? (
            <p style={{ opacity: 0.9, color: 'var(--text-secondary)' }}>{t('noHabits')}</p>
          ) : (
            state.habits.map((habit) => {
              const completedToday = completionSet.has(`${habit.id}|${today}`);
              const streak = getStreak(habit.id, completionSet);
              const total = state.completions.filter((item) => item.habitId === habit.id).length;
              return (
                <div key={habit.id} className="habit-row">
                  <div className="habit-details">
                    <div className="habit-label">
                      <span className="habit-color" style={{ background: habit.color }} />
                      <strong>{habit.name}</strong>
                      {!habit.active && <span style={{ opacity: 0.6 }}>{t('archived')}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{ opacity: 0.8 }}>{t('streak')}: {streak}</span>
                      <span style={{ opacity: 0.8 }}>{t('total')}: {total}</span>
                      <span style={{ opacity: 0.8 }}>{t('last')}: {state.completions
                        .filter((item) => item.habitId === habit.id)
                        .map((item) => item.date)
                        .sort()
                        .pop() ?? '—'}</span>
                      <span style={{ opacity: 0.8 }}>{t('month')}: {stats.habitStats.find(s => s.habitId === habit.id)?.monthlyHours || 0}h</span>
                      <span style={{ opacity: 0.8 }}>{t('week')}: {stats.habitStats.find(s => s.habitId === habit.id)?.weeklyHours || 0}h</span>
                    </div>
                  </div>
                  <div className="habit-actions">
                    <button
                      type="button"
                      className={`marker-button ${completedToday ? 'completed' : ''} ${!habit.active ? 'inactive' : ''}`}
                      disabled={!habit.active}
                      onClick={() => handleMarkToday(habit)}
                    >
                      {t('mark')}
                    </button>
                    <button
                      type="button"
                      className={`marker-button ${!completedToday ? 'inactive' : ''}`}
                      disabled={!habit.active || !completedToday}
                      onClick={() => handleOpenUndo(habit)}
                    >
                      {t('undo')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(habit.id);
                        setEditingName(habit.name);
                      }}
                    >
                      {t('rename')}
                    </button>
                    <button type="button" onClick={() => dispatch({ type: 'toggleHabitActive', payload: { id: habit.id } })}>
                      {habit.active ? t('archive') : t('activate')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="card details-section">
        <h2>{t('details')}</h2>
        <div className="details-content">
          {Array.from({ length: 12 }, (_, i) => {
            const month = monthFormatter.format(new Date(2020, i, 1));
            const monthData = state.habits.map(habit => {
              const completions = state.completions.filter(c => {
                const date = new Date(c.date);
                return c.habitId === habit.id && date.getMonth() === i;
              });
              const totalHours = completions.reduce((sum, c) => sum + (c.hours || 0), 0);
              return { habit: habit.name, hours: totalHours };
            }).filter(d => d.hours > 0);
            return monthData.length > 0 ? (
              <div key={i} className="month-details">
                <h3>{month}</h3>
                <ul>
                  {monthData.map((d, idx) => (
                    <li key={idx}>{d.habit}: {d.hours}h</li>
                  ))}
                </ul>
              </div>
            ) : null;
          })}
        </div>
      </section>

      {selectedDay && (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ opacity: 0.9 }}>{selectedDay} {t('summary')}</h3>
            </div>
            <p style={{ opacity: 0.78, marginTop: '0.75rem' }}>
              {selectedDayItems.length > 0
                ? `${selectedDayItems.length} ${selectedDayItems.length !== 1 ? t('habitsCompleted') : t('habitCompleted')}`
                : t('noCompletedHabitsOnDay')}
            </p>
            <ul className="modal-list">
              {selectedDayItems.length > 0 ? (
                selectedDayItems.map((item) => {
                  const habit = state.habits.find((habitItem) => habitItem.id === item.habitId);
                  const isExpanded = expandedCompletions.has(`${item.habitId}-${selectedDay}`);
                  return (
                    <li key={`${item.habitId}-${selectedDay}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                          <strong>{habit?.name ?? t('unknownHabit')}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCompletionDetails(item.habitId, selectedDay!)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)', borderRadius: '12px' }}>
                          {item.entries.map((entry) => (
                            <div key={entry.id} style={{ marginBottom: '0.75rem' }}>
                              {entry.hours !== undefined && <p><strong>{t('hoursSpent')}:</strong> {entry.hours}h</p>}
                              {entry.note && <p><strong>{t('noteOptional')}:</strong> {entry.note}</p>}
                              {entry.hours === undefined && !entry.note && <p>{t('markedEntry')}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })
              ) : (
                <li style={{ opacity: 0.75 }}>{t('noCompletedHabits')}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {undoModal && (
        <div className="modal-backdrop" onClick={() => setUndoModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ opacity: 0.9 }}>
                {t('undo')} {state.habits.find(h => h.id === undoModal.habitId)?.name}
              </h3>
              <button type="button" onClick={() => setUndoModal(null)}>
                {t('close')}
              </button>
            </div>
            <p style={{ opacity: 0.78, marginTop: '0.75rem' }}>
              {t('undoSelect')}
            </p>
            <ul className="modal-list">
              {undoCompletions.length > 0 ? (
                undoCompletions.map((entry) => (
                  <li key={entry.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        {entry.hours !== undefined && <p><strong>{t('hoursSpent')}:</strong> {entry.hours}h</p>}
                        {entry.note && <p><strong>{t('noteOptional')}:</strong> {entry.note}</p>}
                        {entry.hours === undefined && !entry.note && <p>{t('markedEntry')}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompletion(entry.id)}
                      >
                        {t('removeEntry')}
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li style={{ opacity: 0.75 }}>{t('noCompletionsToUndo')}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {editingId && (
        <div className="modal-backdrop" onClick={() => setEditingId(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ opacity: 0.9 }}>{t('renameHabit')}</h3>
              <button type="button" onClick={() => setEditingId(null)}>
                {t('close')}
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.4)', background: 'var(--input-bg)', color: 'var(--text-primary)' }}
                placeholder={t('habitNamePlaceholder')}
              />
              <button
                type="button"
                style={{ marginTop: '1rem', width: '100%', padding: '0.95rem 1rem', borderRadius: '14px', border: '1px solid var(--button-border)', background: 'var(--button-bg)', color: 'var(--button-text)' }}
                onClick={() => {
                  if (editingName.trim()) {
                    dispatch({ type: 'editHabit', payload: { id: editingId, name: editingName } });
                    setEditingId(null);
                  }
                }}
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {completionModal && (
        <div className="modal-backdrop" onClick={() => setCompletionModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ opacity: 0.9 }}>{t('mark')} {state.habits.find(h => h.id === completionModal.habitId)?.name}</h3>
              <button type="button" onClick={() => setCompletionModal(null)}>
                {t('close')}
              </button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <input
                type="number"
                min={0}
                max={24}
                step={0.1}
                value={completionHours}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === '') {
                    setCompletionHours('');
                    return;
                  }
                  const parsed = Number(value);
                  if (Number.isNaN(parsed)) return;
                  if (parsed < 0) {
                    setCompletionHours('0');
                  } else if (parsed > 24) {
                    setCompletionHours('24');
                  } else {
                    setCompletionHours(value);
                  }
                }}
                style={{ ...completionFieldStyle, marginBottom: '1rem', color: 'var(--text-primary)' }}
                placeholder={t('hoursSpent')}
              />
              <textarea
                value={completionNote}
                onChange={(event) => setCompletionNote(event.target.value)}
                style={{ ...completionFieldStyle, marginBottom: '1rem', resize: 'vertical', minHeight: '96px', color: 'var(--text-primary)' }}
                placeholder={t('noteOptional')}
                rows={3}
              />
              <button
                type="button"
                style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: '14px', border: '1px solid var(--button-border)', background: 'var(--button-bg)', color: 'var(--button-text)' }}
                onClick={handleSaveCompletion}
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
