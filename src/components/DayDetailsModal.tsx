import type { Completion, Habit } from '../types';

type SelectedDayItem = {
  habitId: string;
  entries: Completion[];
};

type DayDetailsModalProps = {
  selectedDay: string | null;

  setSelectedDay: (value: string | null) => void;

  selectedDayItems: SelectedDayItem[];

  habits: Habit[];

  expandedCompletions: Set<string>;

  toggleCompletionDetails: (
    habitId: string,
    date: string,
  ) => void;

  theme: string;

  t: (key: string) => string;
};

export default function DayDetailsModal({
  selectedDay,
  setSelectedDay,
  selectedDayItems,
  habits,
  expandedCompletions,
  toggleCompletionDetails,
  theme,
  t,
}: DayDetailsModalProps) {
  if (!selectedDay) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setSelectedDay(null)}
    >
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ opacity: 0.9 }}>
            {selectedDay} {t('summary')}
          </h3>
        </div>

        <p
          style={{
            opacity: 0.78,
            marginTop: '0.75rem',
          }}
        >
          {selectedDayItems.length > 0
            ? `${selectedDayItems.length} ${
                selectedDayItems.length !== 1
                  ? t('habitsCompleted')
                  : t('habitCompleted')
              }`
            : t('noCompletedHabitsOnDay')}
        </p>

        <ul className="modal-list">
          {selectedDayItems.length > 0 ? (
            selectedDayItems.map((item) => {
              const habit = habits.find(
                (habitItem) =>
                  habitItem.id === item.habitId,
              );

              const isExpanded =
                expandedCompletions.has(
                  `${item.habitId}-${selectedDay}`,
                );

              return (
                <li
                  key={`${item.habitId}-${selectedDay}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      <strong>
                        {habit?.name ??
                          t('unknownHabit')}
                      </strong>
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        toggleCompletionDetails(
                          item.habitId,
                          selectedDay,
                        )
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color:
                          'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background:
                          theme === 'dark'
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(15,23,42,0.04)',
                        borderRadius: '12px',
                      }}
                    >
                      {item.entries.map(
                        (entry) => (
                          <div
                            key={entry.id}
                            style={{
                              marginBottom:
                                '0.75rem',
                            }}
                          >
                            {entry.hours !==
                              undefined && (
                              <p>
                                <strong>
                                  {t(
                                    'hoursSpent',
                                  )}
                                  :
                                </strong>{' '}
                                {entry.hours}h
                              </p>
                            )}

                            {entry.note && (
                              <p>
                                <strong>
                                  {t(
                                    'noteOptional',
                                  )}
                                  :
                                </strong>{' '}
                                {entry.note}
                              </p>
                            )}

                            {entry.hours ===
                              undefined &&
                              !entry.note && (
                                <p>
                                  {t(
                                    'markedEntry',
                                  )}
                                </p>
                              )}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <li style={{ opacity: 0.75 }}>
              {t('noCompletedHabits')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}