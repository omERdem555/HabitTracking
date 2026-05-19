import { useTranslation } from 'react-i18next';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  i18n: {
    language: string;
    changeLanguage: (lng: string) => void;
  };

  openSettings: () => void;
}

function Navbar({
  theme,
  toggleTheme,
  i18n,
  openSettings,
}: NavbarProps) {
  const { t } = useTranslation();

  return (
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
            onClick={() =>
              i18n.changeLanguage(
                i18n.language === 'en' ? 'tr' : 'en'
              )
            }
          >
            {i18n.language === 'en' ? 'TR' : 'ENG'}
          </button>

          <button
            type="button"
            className="theme-button"
            onClick={openSettings}
          >
            ⚙️
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;