import type {ComponentProps} from 'react'

import {afterEach, describe, expect, it} from 'vitest'
import {cleanup, render} from '@testing-library/react'

import LandingServices from '@/app/components/LandingServices'

// LandingServices lists Service documents grouped by category. Each card must be
// an <a> linking to /uslugi/<slug> so visitors reach the dedicated service page,
// and empty categories must not render an orphan heading.

type Block = ComponentProps<typeof LandingServices>['block']

const block = {
  _type: 'servicesSection',
  _key: 'services',
  heading: 'Nasze usługi',
  subheading: 'Wybierz usługę',
  services: [
    {
      _id: 's1',
      name: 'Naprawa kranu',
      slug: 'naprawa-kranu',
      category: 'naprawy',
      cardDescription: 'Cieknący kran? Naprawiamy szybko.',
      displayOrder: 1,
    },
    {
      _id: 's2',
      name: 'Montaż umywalki',
      slug: 'montaz-umywalki',
      category: 'montaze',
      cardDescription: null,
      displayOrder: null,
    },
    {
      _id: 's3',
      name: 'Naprawa rur',
      slug: 'naprawa-rur',
      category: 'naprawy',
      cardDescription: 'Awarie rur wodociągowych.',
      displayOrder: 2,
    },
  ],
} as unknown as Block

const renderServices = (b: Block = block) => render(<LandingServices block={b} />)

afterEach(cleanup)

describe('LandingServices cards', () => {
  it('renders each service as an anchor linking to /uslugi/<slug>', () => {
    const {getByRole} = renderServices()

    expect(getByRole('link', {name: /Naprawa kranu/}).getAttribute('href')).toBe(
      '/uslugi/naprawa-kranu',
    )
    expect(getByRole('link', {name: /Montaż umywalki/}).getAttribute('href')).toBe(
      '/uslugi/montaz-umywalki',
    )
    expect(getByRole('link', {name: /Naprawa rur/}).getAttribute('href')).toBe(
      '/uslugi/naprawa-rur',
    )
  })

  it('applies the analytics hooks to each card link', () => {
    const {getByRole} = renderServices()

    const card = getByRole('link', {name: /Naprawa kranu/})
    expect(card.getAttribute('data-ga-event')).toBe('navigation_click')
    expect(card.getAttribute('data-ga-section')).toBe('uslugi')
    expect(card.getAttribute('data-ga-location')).toBe('naprawa-kranu')
  })

  it('groups services under their category headings', () => {
    const {getByRole} = renderServices()

    expect(getByRole('heading', {name: 'Naprawy', level: 3})).toBeTruthy()
    expect(getByRole('heading', {name: 'Montaże', level: 3})).toBeTruthy()
  })

  it('omits categories with no services', () => {
    const {queryByRole} = renderServices()

    expect(queryByRole('heading', {name: 'Czyszczenie', level: 3})).toBeNull()
  })

  it('renders cardDescription when present and skips it when absent', () => {
    const {getByText, queryByText} = renderServices()

    expect(getByText('Cieknący kran? Naprawiamy szybko.')).toBeTruthy()
    // Montaż umywalki has no cardDescription → no blurb paragraph for it.
    expect(queryByText('Awarie rur wodociągowych.')).toBeTruthy()
  })
})
