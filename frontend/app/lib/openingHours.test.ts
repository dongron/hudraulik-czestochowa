import {describe, expect, it} from 'vitest'

import {toDisplayRows, toOpeningHoursSpecification} from '@/app/lib/openingHours'

// The schedule from the Google Business Profile: Mon–Sat open 24h, Sunday closed.
const profileHours = {
  monday: {mode: 'open24'},
  tuesday: {mode: 'open24'},
  wednesday: {mode: 'open24'},
  thursday: {mode: 'open24'},
  friday: {mode: 'open24'},
  saturday: {mode: 'open24'},
  sunday: {mode: 'closed'},
} as const

describe('toDisplayRows', () => {
  it('lists all seven days in Polish, Monday first', () => {
    const rows = toDisplayRows(profileHours)

    expect(rows.map((row) => row.day)).toEqual([
      'Poniedziałek',
      'Wtorek',
      'Środa',
      'Czwartek',
      'Piątek',
      'Sobota',
      'Niedziela',
    ])
  })

  it('labels 24-hour days as open around the clock and Sunday as closed', () => {
    const rows = toDisplayRows(profileHours)

    expect(rows.slice(0, 6).every((row) => row.hours === 'Otwarte całą dobę')).toBe(true)
    expect(rows[6]).toEqual({day: 'Niedziela', hours: 'Nieczynne'})
  })

  it('shows a specific-hours day as an opening–closing range', () => {
    const rows = toDisplayRows({
      ...profileHours,
      saturday: {mode: 'hours', opens: '08:00', closes: '16:00'},
    })

    expect(rows[5]).toEqual({day: 'Sobota', hours: '08:00–16:00'})
  })

  it('returns no rows when hours are not set', () => {
    expect(toDisplayRows(null)).toEqual([])
    expect(toDisplayRows(undefined)).toEqual([])
    expect(toDisplayRows({})).toEqual([])
  })

  it('skips days without a status instead of inventing hours', () => {
    const rows = toDisplayRows({monday: {mode: 'open24'}, sunday: {mode: 'closed'}})

    expect(rows).toEqual([
      {day: 'Poniedziałek', hours: 'Otwarte całą dobę'},
      {day: 'Niedziela', hours: 'Nieczynne'},
    ])
  })

  it('skips a specific-hours day with missing times', () => {
    const rows = toDisplayRows({monday: {mode: 'hours', opens: '08:00'}})

    expect(rows).toEqual([])
  })
})

describe('toOpeningHoursSpecification', () => {
  it('groups Mon–Sat as open all day and publishes Sunday explicitly as closed', () => {
    expect(toOpeningHoursSpecification(profileHours)).toEqual([
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

  it('gives a specific-hours day its own entry', () => {
    const spec = toOpeningHoursSpecification({
      ...profileHours,
      saturday: {mode: 'hours', opens: '08:00', closes: '16:00'},
    })

    expect(spec).toContainEqual({
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Saturday'],
      'opens': '08:00',
      'closes': '16:00',
    })
    expect(spec?.[0]?.dayOfWeek).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
  })

  it('returns undefined when hours are not set', () => {
    expect(toOpeningHoursSpecification(null)).toBeUndefined()
    expect(toOpeningHoursSpecification(undefined)).toBeUndefined()
    expect(toOpeningHoursSpecification({})).toBeUndefined()
  })

  it('never publishes a day that has no status', () => {
    const spec = toOpeningHoursSpecification({monday: {mode: 'open24'}})

    expect(spec).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday'],
        'opens': '00:00',
        'closes': '23:59',
      },
    ])
  })
})
