import { useTranslation } from 'react-i18next';
import type { AppState } from '../types';

interface SettingsModalProps {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  state: AppState;
  dispatch: React.Dispatch<any>;
  handleSaveSettings: () => void;
}

function SettingsModal({
  settingsOpen,
  setSettingsOpen,
  state,
  dispatch,
  handleSaveSettings,
}: SettingsModalProps) {
  const { t, i18n } = useTranslation();

  if (!settingsOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
      <div
        className="modal settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>
            {i18n.language === 'tr'
              ? 'Bildirim Ayarları'
              : 'Notification Settings'}
          </h3>

          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setSettingsOpen(false)}
          >
            {t('close')}
          </button>
        </div>

        <div className="settings-grid">
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={state.notificationSettings.enabled}
              onChange={async (e) => {
                const enabled = e.target.checked;

                dispatch({
                  type: 'updateNotificationSettings',
                  payload: {
                    ...state.notificationSettings,
                    enabled,
                  },
                });
              }}
            />

            <span>
              {i18n.language === 'tr'
                ? 'Bildirimleri Etkinleştir'
                : 'Enable Notifications'}
            </span>
          </label>

          <div className="settings-field">
            <span className="settings-label">
              {i18n.language === 'tr'
                ? 'Hatırlatma Aralığı (Saat)'
                : 'Reminder Interval (Hours)'}
            </span>

            <select
              value={state.notificationSettings.intervalHours}
              onChange={(e) =>
                dispatch({
                  type: 'updateNotificationSettings',
                  payload: {
                    ...state.notificationSettings,
                    intervalHours: Number(e.target.value),
                  },
                })
              }
            >
              {[1, 2, 3, 4, 6, 8, 12].map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="settings-field">
            <span className="settings-label">
              {i18n.language === 'tr'
                ? 'Başlangıç Saati'
                : 'Start Hour'}
            </span>

            <input
              type="number"
              min={0}
              max={23}
              value={state.notificationSettings.startHour}
              onChange={(e) =>
                dispatch({
                  type: 'updateNotificationSettings',
                  payload: {
                    ...state.notificationSettings,
                    startHour: Number(e.target.value),
                  },
                })
              }
            />
          </div>

          <div className="settings-field">
            <span className="settings-label">
              {i18n.language === 'tr'
                ? 'Bitiş Saati'
                : 'End Hour'}
            </span>

            <input
              type="number"
              min={0}
              max={23}
              value={state.notificationSettings.endHour}
              onChange={(e) =>
                dispatch({
                  type: 'updateNotificationSettings',
                  payload: {
                    ...state.notificationSettings,
                    endHour: Number(e.target.value),
                  },
                })
              }
            />
          </div>

          <button
            type="button"
            className="settings-save-btn"
            onClick={handleSaveSettings}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;