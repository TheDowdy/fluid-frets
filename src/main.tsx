import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { audioEngine } from './audio/engine';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Test hook: lets browser tests inspect the audio engine (dev builds, or add ?debug to the URL).
if (import.meta.env.DEV || new URLSearchParams(location.search).has('debug')) {
  (window as unknown as { __fretscape: unknown }).__fretscape = { audioEngine };
}
