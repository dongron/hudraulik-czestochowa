import {afterEach, describe, expect, it} from 'vitest'
import {cleanup, render} from '@testing-library/react'

import SiteFooter from '@/app/components/SiteFooter'
import type {SettingsQueryResult} from '@/sanity.types'

// SiteFooter renders from the root layout on every route, so its nav anchors
// must be root-relative (/#…). Contact details stay settings-gated.

const settings = {
  title: 'Test Plumbing',
  phone: '500 600 700',
  address: {street: 'ul. Testowa 1', postalCode: '42-200', city: 'Częstochowa'},
} as unknown as SettingsQueryResult

const renderFooter = (s: SettingsQueryResult = settings) => render(<SiteFooter settings={s} />)

afterEach(cleanup)

describe('SiteFooter navigation links', () => {
  it('points every nav link at a root-relative anchor', () => {
    const {getByRole} = renderFooter()

    expect(getByRole('link', {name: 'Usługi'}).getAttribute('href')).toBe('/#uslugi')
    expect(getByRole('link', {name: 'Opinie'}).getAttribute('href')).toBe('/#opinie')
    expect(getByRole('link', {name: 'O mnie'}).getAttribute('href')).toBe('/#o-mnie')
    expect(getByRole('link', {name: 'Kontakt'}).getAttribute('href')).toBe('/#kontakt')
  })

  it('preserves the navigation_click analytics hooks on nav links', () => {
    const {getByRole} = renderFooter()

    const kontakt = getByRole('link', {name: 'Kontakt'})
    expect(kontakt.getAttribute('data-ga-event')).toBe('navigation_click')
    expect(kontakt.getAttribute('data-ga-section')).toBe('kontakt')
  })
})

describe('SiteFooter settings-gated contact details', () => {
  it('renders the phone link with footer analytics hooks when a phone exists', () => {
    const {getByRole} = renderFooter()

    const phone = getByRole('link', {name: '500 600 700'})
    expect(phone.getAttribute('href')).toBe('tel:500600700')
    expect(phone.getAttribute('data-ga-event')).toBe('phone_call')
    expect(phone.getAttribute('data-ga-location')).toBe('footer')
  })

  it('renders the address when one exists', () => {
    const {container} = renderFooter()

    const address = container.querySelector('address')
    expect(address?.textContent).toContain('ul. Testowa 1')
    expect(address?.textContent).toContain('42-200')
    expect(address?.textContent).toContain('Częstochowa')
  })

  it('omits the phone link and address when settings carry neither', () => {
    const {container} = renderFooter(null)

    expect(container.querySelector('[data-ga-event="phone_call"]')).toBeNull()
    expect(container.querySelector('address')).toBeNull()
  })
})
