'use client'

import {Suspense, useActionState, useEffect, useState} from 'react'

import {submitContactForm, type ContactFormState} from '@/app/landing-actions'
import type {LandingPageQueryResult, SettingsQueryResult} from '@/sanity.types'

type ContactBlock = Extract<
  NonNullable<NonNullable<LandingPageQueryResult>['pageBuilder']>[number],
  {_type: 'contactSection'}
>

type Props = {
  block: ContactBlock
  settings: SettingsQueryResult
}

const initialState: ContactFormState = {status: 'idle', message: null}

function ContactFormInner({formEnabled}: {formEnabled: boolean}) {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState)
  const [presetMessage, setPresetMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const intent = params.get('intent')
    if (intent === 'naprawa') {
      setPresetMessage('Dzień dobry, potrzebuję naprawy hydraulicznej. Proszę o kontakt.')
    } else if (intent === 'montaz') {
      setPresetMessage('Dzień dobry, chciałbym zlecić montaż. Proszę o kontakt.')
    } else if (intent === 'czyszczenie') {
      setPresetMessage('Dzień dobry, potrzebuję czyszczenia instalacji. Proszę o kontakt.')
    }
  }, [])

  if (!formEnabled) {
    return (
      <p className="text-center text-gray-600 italic">
        Formularz kontaktowy jest aktualnie niedostępny — proszę dzwonić.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Imię i nazwisko *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefon
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Wiadomość *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          defaultValue={presetMessage}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Wysyłanie...' : 'Wyślij wiadomość'}
      </button>

      {state.status === 'success' && state.message && (
        <p
          role="status"
          className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-green-800"
        >
          {state.message}
        </p>
      )}
      {state.status === 'error' && state.message && (
        <p
          role="alert"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-800"
        >
          {state.message}
        </p>
      )}
    </form>
  )
}

export default function LandingContact({block, settings}: Props) {
  const phone = settings?.phone
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined
  const address = settings?.address
  const mapsUrl = settings?.googleMapsUrl

  return (
    <section id="kontakt" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {block.heading}
          </h2>
          {block.subheading && (
            <p className="text-lg text-gray-600">{block.subheading}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Dane kontaktowe</h3>

            {phoneHref && (
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Telefon
                </p>
                <a
                  href={phoneHref}
                  className="text-2xl font-bold text-blue-600 hover:text-blue-700"
                >
                  {phone}
                </a>
              </div>
            )}

            {address && (
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Adres
                </p>
                <address className="not-italic text-gray-700">
                  {address.street}
                  <br />
                  {address.postalCode} {address.city}
                </address>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Otwórz w Google Maps
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3zM5 5h6v2H5v12h12v-6h2v7a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {settings?.emergencyAvailable && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="font-semibold text-red-700">
                  Pogotowie hydrauliczne 24/7
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Dostępny w nocy i w weekendy w pilnych przypadkach.
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Napisz do nas</h3>
            <Suspense fallback={null}>
              <ContactFormInner formEnabled={block.formEnabled !== false} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
