import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { loadRuntimeConfig } from './api/client';
import { App } from './App';
import './index.css';
import { initializeTheme } from './lib/useColorScheme';

initializeTheme();

// Read the server's settings before the first render so the UI reflects them.
void loadRuntimeConfig().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
