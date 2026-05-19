import { useTranslation } from 'react-i18next';

interface SummaryCardsProps {
  activeHabitsLength: number;
  totalCompletedToday: number;
  longestStreak: number;
  totalCompletions: number;
}

function SummaryCards({
  activeHabitsLength,
  totalCompletedToday,
  longestStreak,
  totalCompletions,
}: SummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <section className="card habit-summary">
      <div className="summary-card">
        <h3>{t('activeHabits')}</h3>
        <p>{activeHabitsLength}</p>
      </div>

      <div className="summary-card">
        <h3>{t('completedToday')}</h3>
        <p>{totalCompletedToday}</p>
      </div>

      <div className="summary-card">
        <h3>{t('longestStreak')}</h3>
        <p>{longestStreak}</p>
      </div>

      <div className="summary-card">
        <h3>{t('totalCompletions')}</h3>
        <p>{totalCompletions}</p>
      </div>
    </section>
  );
}

export default SummaryCards;