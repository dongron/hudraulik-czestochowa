import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {cleanup, fireEvent, render} from '@testing-library/react'

import AnalyticsClickTracker from '@/app/components/AnalyticsClickTracker'

describe('AnalyticsClickTracker', () => {
  let gtag: ReturnType<typeof vi.fn>

  beforeEach(() => {
    gtag = vi.fn()
    window.gtag = gtag as unknown as typeof window.gtag
    render(<AnalyticsClickTracker />)
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    delete window.gtag
  })

  it('derives params from data-ga-* attributes when a child node is clicked', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<a href="tel:123" data-ga-event="phone_call" data-ga-location="hero"><span id="child">Call</span></a>',
    )
    fireEvent.click(document.getElementById('child')!)
    expect(gtag).toHaveBeenCalledWith('event', 'phone_call', {location: 'hero'})
  })

  it('forwards navigation_click with the section param', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<a id="nav" href="#uslugi" data-ga-event="navigation_click" data-ga-section="uslugi">Usługi</a>',
    )
    fireEvent.click(document.getElementById('nav')!)
    expect(gtag).toHaveBeenCalledWith('event', 'navigation_click', {section: 'uslugi'})
  })

  it('ignores clicks with no data-ga-event ancestor', () => {
    document.body.insertAdjacentHTML('beforeend', '<button id="plain">No tracking</button>')
    fireEvent.click(document.getElementById('plain')!)
    expect(gtag).not.toHaveBeenCalled()
  })

  it('ignores unknown event names', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<a id="bad" data-ga-event="purchase" data-ga-amount="10">x</a>',
    )
    fireEvent.click(document.getElementById('bad')!)
    expect(gtag).not.toHaveBeenCalled()
  })

  it('ignores dataset keys that merely start with "ga" (e.g. data-gallery)', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<a id="lookalike" data-ga-event="phone_call" data-ga-location="hero" data-gallery="x">y</a>',
    )
    fireEvent.click(document.getElementById('lookalike')!)
    // Exact params: no spurious key derived from data-gallery.
    expect(gtag).toHaveBeenCalledWith('event', 'phone_call', {location: 'hero'})
  })
})
