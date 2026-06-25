'use client'

import {useEffect} from 'react'

import {isAnalyticsEvent, trackEvent, type AnalyticsEventParams} from '@/app/lib/analytics'

/**
 * Mounts once and listens for clicks anywhere in the document. When a click
 * lands on (or inside) an element carrying `data-ga-event`, the event is
 * forwarded to GA4 with any sibling `data-ga-*` attributes as params
 * (`data-ga-location` -> `location`, etc).
 *
 * This delegation keeps the tracked links as server components: they only need
 * data attributes, no client-side handlers of their own. The listener never
 * calls preventDefault, so navigation/dialing is unaffected.
 */
export default function AnalyticsClickTracker() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return
      const el = event.target.closest<HTMLElement>('[data-ga-event]')
      if (!el) return

      const name = el.dataset.gaEvent
      if (!name || !isAnalyticsEvent(name)) return

      const params: AnalyticsEventParams = {}
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key === 'gaEvent' || !key.startsWith('ga') || value === undefined) continue
        const paramKey = key.slice(2, 3).toLowerCase() + key.slice(3)
        params[paramKey] = value
      }

      trackEvent(name, params)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
