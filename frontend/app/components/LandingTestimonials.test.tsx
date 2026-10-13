import type {ComponentProps} from 'react'

import {afterEach, describe, expect, it} from 'vitest'
import {cleanup, render} from '@testing-library/react'

import LandingTestimonials from '@/app/components/LandingTestimonials'

type Props = ComponentProps<typeof LandingTestimonials>

const review = (id: string, authorName: string, text: string) => ({
  _id: id,
  authorName,
  text,
  rating: 5,
})

const blockWith = (overrides: Record<string, unknown>) =>
  ({
    _key: 'testimonials',
    _type: 'testimonialsSection',
    heading: 'Co mówią nasi klienci',
    subheading: null,
    yearsExperience: 10,
    reviews: null,
    sourceNote: null,
    sourceLinkLabel: null,
    testimonials: null,
    ...overrides,
  }) as unknown as Props['block']

const settingsWith = (overrides: Record<string, unknown>) =>
  ({
    googleMapsUrl: 'https://share.google/iTFr7fdAX5pKqkf48',
    ...overrides,
  }) as unknown as Props['settings']

const authorNames = (container: HTMLElement) =>
  [...container.querySelectorAll('figcaption')].map((el) => el.textContent)

afterEach(cleanup)

describe('LandingTestimonials reviews', () => {
  it('shows the selected Google reviews in order', () => {
    const block = blockWith({
      reviews: [
        review('r1', 'Angelika N.', 'Bardzo polecam!'),
        review('r2', 'Filip B.', 'Najlepszy fachowiec w Częstochowie.'),
        review('r3', 'Agnieszka W.', 'Firma godna polecenia.'),
      ],
    })

    const {container} = render(<LandingTestimonials block={block} settings={settingsWith({})} />)

    expect(authorNames(container)).toEqual(['Angelika N.', 'Filip B.', 'Agnieszka W.'])
    expect(container.textContent).toContain('Najlepszy fachowiec w Częstochowie.')
  })

  // A reference to an unpublished or deleted review resolves to null in GROQ.
  it('skips reviews that no longer exist', () => {
    const block = blockWith({reviews: [review('r1', 'Angelika N.', 'Bardzo polecam!'), null]})

    const {container} = render(<LandingTestimonials block={block} settings={settingsWith({})} />)

    expect(authorNames(container)).toEqual(['Angelika N.'])
  })

  // Expand-then-contract: until the home page selects reviews, the old testimonials stay visible.
  it('falls back to the old testimonials when no reviews are selected', () => {
    const block = blockWith({
      reviews: [],
      testimonials: [{_key: 't1', authorName: 'Marek K.', text: 'Fachowa obsługa.', rating: 5}],
    })

    const {container} = render(<LandingTestimonials block={block} settings={settingsWith({})} />)

    expect(authorNames(container)).toEqual(['Marek K.'])
  })
})

describe('LandingTestimonials source link', () => {
  it('links the source note to the Google profile in a new tab', () => {
    const block = blockWith({
      reviews: [review('r1', 'Angelika N.', 'Bardzo polecam!')],
      sourceNote: 'Opinie klientów z naszej wizytówki Google.',
      sourceLinkLabel: 'Zobacz wszystkie opinie w Google',
    })

    const {container, getByRole} = render(
      <LandingTestimonials block={block} settings={settingsWith({})} />,
    )

    expect(container.textContent).toContain('Opinie klientów z naszej wizytówki Google.')
    const link = getByRole('link', {name: 'Zobacz wszystkie opinie w Google'})
    expect(link.getAttribute('href')).toBe('https://share.google/iTFr7fdAX5pKqkf48')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('shows no link when the Google profile URL is missing', () => {
    const block = blockWith({
      reviews: [review('r1', 'Angelika N.', 'Bardzo polecam!')],
      sourceNote: 'Opinie klientów z naszej wizytówki Google.',
      sourceLinkLabel: 'Zobacz wszystkie opinie w Google',
    })

    const {container} = render(
      <LandingTestimonials block={block} settings={settingsWith({googleMapsUrl: null})} />,
    )

    expect(container.querySelector('a')).toBeNull()
  })
})
