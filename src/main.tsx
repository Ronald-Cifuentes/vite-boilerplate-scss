import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './shared/components/App'
import './main.scss'

// HIGH-001: Global unhandled rejection handler (template seam for Sentry etc.)
window.addEventListener('unhandledrejection', e => console.error('[UnhandledRejection]', e.reason))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
