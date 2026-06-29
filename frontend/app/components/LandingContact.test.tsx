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
