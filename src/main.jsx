import React from 'react';
import ReactDOM from 'react-dom/client';
import SpaceJumpMainMenu from './components/SpaceJumpMainMenu';
import { viewport } from '@telegram-apps/sdk';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SpaceJumpMainMenu />
  </React.StrictMode>
);

// Request fullscreen in supported Telegram clients
try {
  viewport?.requestFullscreen?.();
} catch (e) {
  // ignore errors if the method is unavailable
}
