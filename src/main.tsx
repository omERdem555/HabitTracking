import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root';
import './styles.css';
import './i18n/config';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Root />
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        registration.update();
      })
      .catch((err) => {
        console.error('SW registration failed', err);
      });
  });
}
