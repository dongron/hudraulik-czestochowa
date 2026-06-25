import {afterEach, describe, expect, it, vi} from 'vitest'

import {isAnalyticsEvent, trackEvent} from '@/app/lib/analytics'

describe('isAnalyticsEvent', () => {
  it('accepts the known GA4 event names', () => {
    expect(isAnalyticsEvent('phone_call')).toBe(true)
    expect(isAnalyticsEvent('generate_lead')).toBe(true)
    expect(isAnalyticsEvent('maps_click')).toBe(true)
    expect(isAnalyticsEvent('navigation_click')).toBe(true)
  })

  it('rejects unknown names', () => {
    expect(isAnalyticsEvent('purchase')).toBe(false)
    expect(isAnalyticsEvent('')).toBe(false)
  })
})

describe('trackEvent', () => {
  afterEach(() => {
    delete window.gtag
  })

  it('forwards the event name and params to gtag', () => {
    const gtag = vi.fn()
    window.gtag = gtag as unknown as typeof window.gtag
    trackEvent('phone_call', {location: 'hero'})
    expect(gtag).toHaveBeenCalledWith('event', 'phone_call', {location: 'hero'})
  })

  it('no-ops (does not throw) when gtag has not loaded', () => {
    delete window.gtag
    expect(() => trackEvent('maps_click', {location: 'contact'})).not.toThrow()
  })
})
