import { useTranslation } from 'react-i18next';
import type { AppState, Completion } from '../types';

interface UndoModalProps {
  undoModal: { habitId: string; date: string } | null;
  setUndoModal: (value: null) => void;

  state: AppState;

  undoCompletions: Completion[];

  handleRemoveCompletion: (id: string) => void;
}

function UndoModal({
  undoModal,
  setUndoModal,
  state,
  undoCompletions,
  handleRemoveCompletion,
}: UndoModalProps) {
  const { t } = useTranslation();

  if (!undoModal) return null;

  const habitName =
    state.habits.find((h) => h.id === undoModal.habitId)?.name;

  return (
    <div className="modal-backdrop" onClick={() => setUndoModal(null)}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ opacity: 0.9 }}>
            {t('undo')} {habitName}
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div>
                    {entry.hours !== undefined && (
                      <p>
                        <strong>{t('hoursSpent')}:</strong>{' '}
                        {entry.hours}h
                      </p>
                    )}

                    {entry.note && (
                      <p>
                        <strong>{t('noteOptional')}:</strong>{' '}
                        {entry.note}
                      </p>
                    )}

                    {entry.hours === undefined && !entry.note && (
                      <p>{t('markedEntry')}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveCompletion(entry.id)
                    }
                  >
                    {t('removeEntry')}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li style={{ opacity: 0.75 }}>
              {t('noCompletionsToUndo')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default UndoModal;