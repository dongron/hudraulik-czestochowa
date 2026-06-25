/**
 * Google Analytics 4 helper.
 *
 * The Measurement ID comes from NEXT_PUBLIC_GA_ID. When it is empty (local dev
 * without analytics, preview builds) GA is never loaded and `trackEvent` no-ops,
 * so calls are always safe to make.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

/**
 * Event names sent to GA4. Treat as a contract: renaming after launch breaks
 * historical reports.
 */
export const ANALYTICS_EVENTS = [
  'phone_call',
  'generate_lead',
  'maps_click',
  'navigation_click',
] as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number]

export type AnalyticsEventParams = Record<string, string | number | boolean>

type GtagCommand = 'config' | 'event' | 'js' | 'set' | 'consent'

type Gtag = (command: GtagCommand, ...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: Gtag
  }
}

/** Type guard: true when `value` is one of the known GA4 event names. */
export function isAnalyticsEvent(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value)
}

/**
 * Send a GA4 event. Safe to call anywhere: no-ops on the server and whenever GA
 * has not loaded (e.g. NEXT_PUBLIC_GA_ID unset, or before gtag.js hydrates).
 */
export function trackEvent(name: AnalyticsEventName, params?: AnalyticsEventParams): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
