import type {DayHours} from '@/sanity.types'

// Single source for both the visible hours block and the schema.org data, so the
// two can never disagree with each other (or with the Google Business Profile).

const DAYS = [
  {key: 'monday', label: 'Poniedziałek', schemaDay: 'Monday'},
  {key: 'tuesday', label: 'Wtorek', schemaDay: 'Tuesday'},
  {key: 'wednesday', label: 'Środa', schemaDay: 'Wednesday'},
  {key: 'thursday', label: 'Czwartek', schemaDay: 'Thursday'},
  {key: 'friday', label: 'Piątek', schemaDay: 'Friday'},
  {key: 'saturday', label: 'Sobota', schemaDay: 'Saturday'},
  {key: 'sunday', label: 'Niedziela', schemaDay: 'Sunday'},
] as const

type Day = Partial<Pick<DayHours, 'mode' | 'opens' | 'closes'>>

export type OpeningHours = Partial<Record<(typeof DAYS)[number]['key'], Day | undefined>>

export type OpeningHoursSpecification = {
  '@type': 'OpeningHoursSpecification'
  'dayOfWeek': string[]
  'opens': string
  'closes': string
}

type ResolvedDay = {opens: string; closes: string; text: string}

// Uses Google's conventions: open all day is 00:00–23:59, closed all day is
// 00:00–00:00. Null means the day is not (validly) set and must not be published.
const resolveDay = (day: Day | undefined): ResolvedDay | null => {
  switch (day?.mode) {
    case 'open24':
      return {opens: '00:00', closes: '23:59', text: 'Otwarte całą dobę'}
    case 'closed':
      return {opens: '00:00', closes: '00:00', text: 'Nieczynne'}
    case 'hours':
      return day.opens && day.closes
        ? {opens: day.opens, closes: day.closes, text: `${day.opens}–${day.closes}`}
        : null
    default:
      return null
  }
}

export const toDisplayRows = (hours: OpeningHours | null | undefined) =>
  DAYS.flatMap(({key, label}) => {
    const day = resolveDay(hours?.[key])
    return day ? [{day: label, hours: day.text}] : []
  })

export const toOpeningHoursSpecification = (
  hours: OpeningHours | null | undefined,
): OpeningHoursSpecification[] | undefined => {
  const groups = new Map<string, OpeningHoursSpecification>()

  for (const {key, schemaDay} of DAYS) {
    const day = resolveDay(hours?.[key])
    if (!day) continue
    const groupKey = `${day.opens}-${day.closes}`
    const group = groups.get(groupKey)
    if (group) {
      group.dayOfWeek.push(schemaDay)
    } else {
      groups.set(groupKey, {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [schemaDay],
        'opens': day.opens,
        'closes': day.closes,
      })
    }
  }

  return groups.size > 0 ? [...groups.values()] : undefined
}
