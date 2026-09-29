import type {ComponentProps} from 'react'

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {cleanup, fireEvent, render, waitFor} from '@testing-library/react'

// LandingContact relies on a server action and the app-router search params,
// neither of which exists in a bare jsdom render — mock both.
vi.mock('@/app/landing-actions', () => ({
  submitContactForm: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

import LandingContact from '@/app/components/LandingContact'
import {submitContactForm} from '@/app/landing-actions'

const renderContact = () =>
  render(
    <LandingContact
      block={
        {
          _type: 'contactSection',
          _key: 'contact',
          heading: 'Kontakt',
          subheading: null,
          formEnabled: true,
        } as unknown as ComponentProps<typeof LandingContact>['block']
      }
      settings={null}
    />,
  )

describe('LandingContact generate_lead tracking', () => {
  let gtag: ReturnType<typeof vi.fn>

  beforeEach(() => {
    gtag = vi.fn()
    window.gtag = gtag as unknown as typeof window.gtag
  })

  afterEach(() => {
    cleanup()
    delete window.gtag
    vi.clearAllMocks()
  })

  const fillRequiredFields = (
    getByLabelText: ReturnType<typeof renderContact>['getByLabelText'],
  ) => {
    fireEvent.change(getByLabelText(/Imię i nazwisko/i), {target: {value: 'Jan Kowalski'}})
    fireEvent.change(getByLabelText(/E-mail/i), {target: {value: 'jan@example.com'}})
    fireEvent.change(getByLabelText(/Wiadomość/i), {target: {value: 'Proszę o kontakt.'}})
  }

  it('fires generate_lead once on a successful submit', async () => {
    vi.mocked(submitContactForm).mockResolvedValue({status: 'success', message: 'ok'})
    const {getByLabelText, getByRole} = renderContact()

    fillRequiredFields(getByLabelText)
    fireEvent.click(getByRole('button', {name: /Wyślij/i}))

    await waitFor(() =>
      expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {
        method: 'form',
        form_location: 'contact',
      }),
    )
    expect(gtag).toHaveBeenCalledTimes(1)
  })

  it('does not fire on a failed submit', async () => {
    vi.mocked(submitContactForm).mockResolvedValue({status: 'error', message: 'bad'})
    const {getByLabelText, getByRole, findByRole} = renderContact()

    fillRequiredFields(getByLabelText)
    fireEvent.click(getByRole('button', {name: /Wyślij/i}))

    // Wait for the error state to render before asserting no event fired.
    await findByRole('alert')
    expect(gtag).not.toHaveBeenCalled()
  })
})

describe('LandingContact opening hours', () => {
  afterEach(() => {
    cleanup()
  })

  const contactBlock = {
    _type: 'contactSection',
    _key: 'contact',
    heading: 'Kontakt',
    subheading: null,
    formEnabled: false,
  } as unknown as ComponentProps<typeof LandingContact>['block']

  const settingsWith = (overrides: Record<string, unknown>) =>
    ({
      phone: '+48 518 893 308',
      emergencyAvailable: true,
      ...overrides,
    }) as unknown as ComponentProps<typeof LandingContact>['settings']

  const profileHours = {
    monday: {_type: 'dayHours', mode: 'open24'},
    tuesday: {_type: 'dayHours', mode: 'open24'},
    wednesday: {_type: 'dayHours', mode: 'open24'},
    thursday: {_type: 'dayHours', mode: 'open24'},
    friday: {_type: 'dayHours', mode: 'open24'},
    saturday: {_type: 'dayHours', mode: 'open24'},
    sunday: {_type: 'dayHours', mode: 'closed'},
  }

  it('lists every day with its hours as day/hours pairs', () => {
    const {getByRole} = render(
      <LandingContact block={contactBlock} settings={settingsWith({openingHours: profileHours})} />,
    )

    const list = getByRole('heading', {name: 'Godziny otwarcia'}).nextElementSibling
    expect(list?.tagName).toBe('DL')
    const days = [...(list?.querySelectorAll('dt') ?? [])].map((dt) => dt.textContent)
    const hours = [...(list?.querySelectorAll('dd') ?? [])].map((dd) => dd.textContent)
    expect(days).toEqual([
      'Poniedziałek',
      'Wtorek',
      'Środa',
      'Czwartek',
      'Piątek',
      'Sobota',
      'Niedziela',
    ])
    expect(hours).toEqual([...Array(6).fill('Otwarte całą dobę'), 'Nieczynne'])
  })

  it('hides the block when no hours are set', () => {
    const {queryByRole} = render(
      <LandingContact block={contactBlock} settings={settingsWith({openingHours: undefined})} />,
    )

    expect(queryByRole('heading', {name: 'Godziny otwarcia'})).toBeNull()
  })

  it('shows the hours even when emergency service is switched off', () => {
    const {getByRole} = render(
      <LandingContact
        block={contactBlock}
        settings={settingsWith({openingHours: profileHours, emergencyAvailable: false})}
      />,
    )

    expect(getByRole('heading', {name: 'Godziny otwarcia'})).toBeTruthy()
  })

  it('describes emergency service as Mon–Sat without 24/7 or weekend claims', () => {
    const {container} = render(
      <LandingContact block={contactBlock} settings={settingsWith({openingHours: profileHours})} />,
    )

    const text = container.textContent ?? ''
    expect(text).toContain('całą dobę od poniedziałku do soboty')
    expect(text).not.toMatch(/24\/7|weekend/i)
  })
})
