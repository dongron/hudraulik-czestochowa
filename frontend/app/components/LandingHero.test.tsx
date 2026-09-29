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
