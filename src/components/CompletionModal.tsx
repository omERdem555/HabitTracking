import type { CSSProperties } from 'react';
import type { Habit } from '../types';

type CompletionModalProps = {
  completionModal: {
    habitId: string;
    date: string;
  } | null;

  setCompletionModal: (
    value: {
      habitId: string;
      date: string;
    } | null
  ) => void;

  completionHours: string;
  setCompletionHours: (value: string) => void;

  completionNote: string;
  setCompletionNote: (value: string) => void;

  completionFieldStyle: CSSProperties;

  handleSaveCompletion: () => void;

  habits: Habit[];

  t: (key: string) => string;
};

export default function CompletionModal({
  completionModal,
  setCompletionModal,
  completionHours,
  setCompletionHours,
  completionNote,
  setCompletionNote,
  completionFieldStyle,
  handleSaveCompletion,
  habits,
  t,
}: CompletionModalProps) {
  if (!completionModal) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setCompletionModal(null)}
    >
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ opacity: 0.9 }}>
            {t('mark')}{' '}
            {habits.find(
              (h) => h.id === completionModal.habitId,
            )?.name}
          </h3>

          <button
            type="button"
            onClick={() => setCompletionModal(null)}
          >
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
            style={{
              ...completionFieldStyle,
              marginBottom: '1rem',
              color: 'var(--text-primary)',
            }}
            placeholder={t('hoursSpent')}
          />

          <textarea
            value={completionNote}
            onChange={(event) =>
              setCompletionNote(event.target.value)
            }
            style={{
              ...completionFieldStyle,
              marginBottom: '1rem',
              resize: 'vertical',
              minHeight: '96px',
              color: 'var(--text-primary)',
            }}
            placeholder={t('noteOptional')}
            rows={3}
          />

          <button
            type="button"
            style={{
              width: '100%',
              padding: '0.95rem 1rem',
              borderRadius: '14px',
              border: '1px solid var(--button-border)',
              background: 'var(--button-bg)',
              color: 'var(--button-text)',
            }}
            onClick={handleSaveCompletion}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}