import type {ComponentProps} from 'react'

import {afterEach, describe, expect, it} from 'vitest'
import {cleanup, render} from '@testing-library/react'

import LocalBusinessSchema from '@/app/components/LocalBusinessSchema'

type Settings = ComponentProps<typeof LocalBusinessSchema>['settings']

const profileHours = {
  monday: {_type: 'dayHours', mode: 'open24'},
  tuesday: {_type: 'dayHours', mode: 'open24'},
  wednesday: {_type: 'dayHours', mode: 'open24'},
  thursday: {_type: 'dayHours', mode: 'open24'},
  friday: {_type: 'dayHours', mode: 'open24'},
  saturday: {_type: 'dayHours', mode: 'open24'},
  sunday: {_type: 'dayHours', mode: 'closed'},
}

const settingsWith = (overrides: Record<string, unknown>) =>
  ({
    title: 'Usługi Hydrauliczne Częstochowa',
    phone: '+48 518 893 308',
    googleMapsUrl: 'https://share.google/iTFr7fdAX5pKqkf48',
    websiteUrl: 'https://hydraulik-czestochowa-24.pl/',
    emergencyAvailable: true,
    openingHours: profileHours,
    ...overrides,
  }) as unknown as Settings

const renderJsonLd = (settings: Settings) => {
  const {container} = render(<LocalBusinessSchema settings={settings} />)
  const script = container.querySelector('script[type="application/ld+json"]')
  return JSON.parse(script?.textContent ?? 'null')
}

describe('LocalBusinessSchema', () => {
  afterEach(() => {
    cleanup()
  })

  it('publishes Mon–Sat as open all day and Sunday explicitly as closed', () => {
    const data = renderJsonLd(settingsWith({}))

    expect(data.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '00:00',
        'closes': '23:59',
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Sunday'],
        'opens': '00:00',
        'closes': '00:00',
      },
    ])
  })

  it('publishes the hours even when emergency service is switched off', () => {
    const data = renderJsonLd(settingsWith({emergencyAvailable: false}))

    expect(data.openingHoursSpecification).toHaveLength(2)
  })

  it('omits opening hours entirely when none are set', () => {
    const data = renderJsonLd(settingsWith({openingHours: undefined}))

    expect(data).not.toHaveProperty('openingHoursSpecification')
  })

  it('uses the site address as the website and the Maps link as the map', () => {
    const data = renderJsonLd(settingsWith({}))

    expect(data.url).toBe('https://hydraulik-czestochowa-24.pl/')
    expect(data.hasMap).toBe('https://share.google/iTFr7fdAX5pKqkf48')
  })

  it('never falls back to the Maps link as the website', () => {
    const data = renderJsonLd(settingsWith({websiteUrl: undefined}))

    expect(data).not.toHaveProperty('url')
  })
})
