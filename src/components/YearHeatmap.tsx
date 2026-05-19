import { useTranslation } from 'react-i18next';

interface DayData {
  day: string;
  count: number;
  allComplete: boolean;
}

interface YearRow {
  year: number;
  days: DayData[];
}

interface YearHeatmapProps {
  yearSummary: YearRow[];
  activeHabitsLength: number;
  today: string;
  setSelectedDay: (day: string) => void;
  getDayBackground: (count: number, total: number) => string;
}

function YearHeatmap({
  yearSummary,
  activeHabitsLength,
  today,
  setSelectedDay,
  getDayBackground,
}: YearHeatmapProps) {
  const { t } = useTranslation();

  if (!yearSummary.length) return null;

  return (
    <section className="card calendar-grid">
      <h2 style={{ opacity: 0.85 }}>
        {t('calendarPerformance')}
      </h2>

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
                  background: getDayBackground(
                    day.count,
                    activeHabitsLength
                  ),

                  boxShadow: day.allComplete
                    ? `0 0 0 2px rgba(96, 165, 250, 0.4),
                       0 0 15px rgba(96, 165, 250, 0.22)`
                    : day.day === today
                    ? '0 0 0 0.5px rgba(14, 165, 233, 0.55), 0 0 12px rgba(14, 165, 233, 0.16)'
                    : undefined,

                  borderColor:
                    day.day === today
                      ? '#0ea5e9'
                      : 'rgba(148, 163, 184, 0.24)',
                }}
                onClick={() => setSelectedDay(day.day)}
                aria-label={`${day.day}, ${day.count} completed habit${
                  day.count !== 1 ? 's' : ''
                }`}
                title={`${day.day} — ${day.count} completed habit${
                  day.count !== 1 ? 's' : ''
                }`}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default YearHeatmap;