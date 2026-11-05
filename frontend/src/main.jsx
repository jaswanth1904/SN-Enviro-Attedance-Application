import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize Sentry for Error Tracking and User Session Replays (Only sample crashes to avoid page load blocking)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://public@sentry.example.com/2",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring: sample 10% in production to keep CPU and network free
  tracesSampleRate: 0.1, 
  tracePropagationTargets: ["localhost", /^https:\/\/attendance\.snenviro\.org/],
  // Session Replay: Only capture replays when an error happens (Zero overhead on normal loads)
  replaysSessionSampleRate: 0.0, 
  replaysOnErrorSampleRate: 1.0, 
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
