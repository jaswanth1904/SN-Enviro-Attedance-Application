import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize Sentry for Error Tracking and User Session Replays
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://public@sentry.example.com/2", // Replace with your Frontend Sentry DSN
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  tracePropagationTargets: ["localhost", /^https:\/\/attendance\.snenviro\.org/],
  // Session Replay (Captures video-like replays of crashes)
  replaysSessionSampleRate: 0.1, 
  replaysOnErrorSampleRate: 1.0, 
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
