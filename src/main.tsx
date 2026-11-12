import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './index.css';

// The site link opens on the home page (Pitch mode or Live prototype); links into the app (#/pitch, #/map…) go straight there.
if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') window.history.replaceState(null, '', '#/start');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
