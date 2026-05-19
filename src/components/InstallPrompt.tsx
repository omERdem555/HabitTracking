import type { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

interface InstallPromptProps {
  showInstallPrompt: boolean;
  handleInstallApp: () => void;
  setShowInstallPrompt: Dispatch<SetStateAction<boolean>>;
}

function InstallPrompt({
  showInstallPrompt,
  handleInstallApp,
  setShowInstallPrompt,
}: InstallPromptProps) {
  const { i18n } = useTranslation();

  if (!showInstallPrompt) return null;

  return (
    <section className="card" style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%',
        }}
      >
        <div style={{ width: '100%' }}>
          <strong
            style={{
              display: 'block',
              marginBottom: '0.35rem',
              lineHeight: '1.5',
              color: 'var(--text-primary)',
            }}
          >
            {i18n.language === 'tr'
              ? 'Bildirimler ve çevrimdışı kullanım için uygulamayı yükleyin'
              : 'Install app for reminders & offline use'}
          </strong>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            width: '100%',
          }}
        >
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
      </div>
    </section>
  );
}

export default InstallPrompt;