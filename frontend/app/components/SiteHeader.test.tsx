import {afterEach, describe, expect, it} from 'vitest'
import {cleanup, render} from '@testing-library/react'

import SiteHeader from '@/app/components/SiteHeader'
import type {SettingsQueryResult} from '@/sanity.types'

// SiteHeader is site-wide chrome rendered from the root layout, so its anchors
// must be root-relative (/#…) to work from /posts/* and /[slug] pages, not just
// the home page. These tests guard that contract plus the analytics hooks.

const settings = {
  title: 'Test Plumbing',
  phone: '500 600 700',
} as unknown as SettingsQueryResult

const renderHeader = (s: SettingsQueryResult = settings) => render(<SiteHeader settings={s} />)

afterEach(cleanup)

describe('SiteHeader navigation links', () => {
  it('points every section link at a root-relative anchor', () => {
    const {getByRole} = renderHeader()

    expect(getByRole('link', {name: 'Usługi'}).getAttribute('href')).toBe('/#uslugi')
    expect(getByRole('link', {name: 'Opinie'}).getAttribute('href')).toBe('/#opinie')
    expect(getByRole('link', {name: 'O mnie'}).getAttribute('href')).toBe('/#o-mnie')
    expect(getByRole('link', {name: 'Kontakt'}).getAttribute('href')).toBe('/#kontakt')
  })

  it('links the logo back to the home page', () => {
    const {getByRole} = renderHeader()

    expect(getByRole('link', {name: 'Test Plumbing'}).getAttribute('href')).toBe('/')
  })

  it('preserves the navigation_click analytics hooks on section links', () => {
    const {getByRole} = renderHeader()

    const uslugi = getByRole('link', {name: 'Usługi'})
    expect(uslugi.getAttribute('data-ga-event')).toBe('navigation_click')
    expect(uslugi.getAttribute('data-ga-section')).toBe('uslugi')
  })
})

describe('SiteHeader phone CTA', () => {
  it('renders a tel: link with spaces stripped and analytics hooks when a phone exists', () => {
    const {getByLabelText} = renderHeader()

    const cta = getByLabelText('Zadzwoń 500 600 700')
    expect(cta.getAttribute('href')).toBe('tel:500600700')
    expect(cta.getAttribute('data-ga-event')).toBe('phone_call')
    expect(cta.getAttribute('data-ga-location')).toBe('nav')
  })

  it('omits the phone CTA when settings carry no phone', () => {
    const {container} = renderHeader(null)

    expect(container.querySelector('[data-ga-event="phone_call"]')).toBeNull()
  })
})
