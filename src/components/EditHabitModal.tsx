type EditHabitModalProps = {
  editingId: string | null;

  editingName: string;

  setEditingId: (
    value: string | null,
  ) => void;

  setEditingName: (
    value: string,
  ) => void;

  t: (key: string) => string;

  onSave: () => void;
};

export default function EditHabitModal({
  editingId,
  editingName,
  setEditingId,
  setEditingName,
  t,
  onSave,
}: EditHabitModalProps) {
  if (!editingId) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setEditingId(null)}
    >
      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <h3 style={{ opacity: 0.9 }}>
            {t('renameHabit')}
          </h3>

          <button
            type="button"
            onClick={() =>
              setEditingId(null)
            }
          >
            {t('close')}
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <input
            value={editingName}
            onChange={(event) =>
              setEditingName(
                event.target.value,
              )
            }
            style={{
              width: '100%',
              padding: '0.95rem 1rem',
              borderRadius: '14px',
              border:
                '1px solid rgba(148, 163, 184, 0.4)',
              background:
                'var(--input-bg)',
              color:
                'var(--text-primary)',
            }}
            placeholder={t(
              'habitNamePlaceholder',
            )}
          />

          <button
            type="button"
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.95rem 1rem',
              borderRadius: '14px',
              border:
                '1px solid var(--button-border)',
              background:
                'var(--button-bg)',
              color:
                'var(--button-text)',
            }}
            onClick={onSave}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}