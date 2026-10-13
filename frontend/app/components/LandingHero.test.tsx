import type {ComponentProps} from 'react'

import {afterEach, describe, expect, it} from 'vitest'
import {cleanup, render} from '@testing-library/react'

import LandingHero from '@/app/components/LandingHero'

const heroBlock = {
  _type: 'heroSection',
  _key: 'hero',
  heading: 'Profesjonalne usługi hydrauliczne',
  ctaLabel: 'Zadzwoń teraz',
} as unknown as ComponentProps<typeof LandingHero>['block']

const settingsWith = (overrides: Record<string, unknown>) =>
  ({phone: '+48 518 893 308', ...overrides}) as unknown as ComponentProps<
    typeof LandingHero
  >['settings']

describe('LandingHero emergency badge', () => {
  afterEach(() => {
    cleanup()
  })

  it('advertises round-the-clock service Mon–Sat without 24/7 or weekend claims', () => {
    const {container} = render(
      <LandingHero block={heroBlock} settings={settingsWith({emergencyAvailable: true})} />,
    )

    const text = container.textContent ?? ''
    expect(text).toContain('Pogotowie całą dobę, pon–sob')
    expect(text).not.toMatch(/24\/7|weekend/i)
  })

  it('hides the badge when emergency service is switched off', () => {
    const {container} = render(
      <LandingHero block={heroBlock} settings={settingsWith({emergencyAvailable: false})} />,
    )

    expect(container.textContent).not.toContain('Pogotowie')
  })
})

describe('LandingHero background image', () => {
  afterEach(() => {
    cleanup()
  })

  // Cloudflare serves /_next/image originals as-is, so the source file itself must be light.
  it('uses the WebP hero image', () => {
    const {container} = render(<LandingHero block={heroBlock} settings={settingsWith({})} />)

    const src = decodeURIComponent(container.querySelector('img')?.getAttribute('src') ?? '')
    expect(src).toContain('/images/hero-bg.webp')
  })
})

describe('LandingHero headings', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the eyebrow as the only h1', () => {
    const block = {...heroBlock, eyebrow: 'Hydraulik Częstochowa'} as typeof heroBlock

    const {container} = render(<LandingHero block={block} settings={settingsWith({})} />)

    const h1s = [...container.querySelectorAll('h1')].map((h) => h.textContent)
    expect(h1s).toEqual(['Hydraulik Częstochowa'])
  })

  it('still shows the heading text, outside the h1', () => {
    const block = {...heroBlock, eyebrow: 'Hydraulik Częstochowa'} as typeof heroBlock

    const {container} = render(<LandingHero block={block} settings={settingsWith({})} />)

    expect(container.textContent).toContain('Profesjonalne usługi hydrauliczne')
  })

  it('falls back to the heading as h1 when there is no eyebrow', () => {
    const {container} = render(<LandingHero block={heroBlock} settings={settingsWith({})} />)

    const h1s = [...container.querySelectorAll('h1')].map((h) => h.textContent)
    expect(h1s).toEqual(['Profesjonalne usługi hydrauliczne'])
  })
})
