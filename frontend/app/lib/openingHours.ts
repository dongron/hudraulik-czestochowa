import type {DayHours} from '@/sanity.types'

// Single source for both the visible hours block and the schema.org data, so the
// two can never disagree with each other (or with the Google Business Profile).

type Day = Partial<Pick<DayHours, 'mode' | 'opens' | 'closes'>>

export type OpeningHours = Partial<Record<(typeof DAYS)[number]['key'], Day | undefined>>

export type OpeningHoursSpecification = {
  '@type': 'OpeningHoursSpecification'
  'dayOfWeek': string[]
  'opens': string
  'closes': string
}

const DAYS = [
  {key: 'monday', label: 'Poniedziałek', schemaDay: 'Monday'},
  {key: 'tuesday', label: 'Wtorek', schemaDay: 'Tuesday'},
  {key: 'wednesday', label: 'Środa', schemaDay: 'Wednesday'},
  {key: 'thursday', label: 'Czwartek', schemaDay: 'Thursday'},
  {key: 'friday', label: 'Piątek', schemaDay: 'Friday'},
  {key: 'saturday', label: 'Sobota', schemaDay: 'Saturday'},
  {key: 'sunday', label: 'Niedziela', schemaDay: 'Sunday'},
] as const

// Returns [opens, closes] using Google's conventions: open all day is 00:00–23:59,
// closed all day is 00:00–00:00. Null means the day is not (validly) set.
const toTimeRange = (day: Day | undefined): [string, string] | null => {
  switch (day?.mode) {
    case 'open24':
      return ['00:00', '23:59']
    case 'closed':
      return ['00:00', '00:00']
    case 'hours':
      return day.opens && day.closes ? [day.opens, day.closes] : null
    default:
      return null
  }
}

export const toDisplayRows = (hours: OpeningHours | null | undefined) =>
  DAYS.flatMap(({key, label}) => {
    const day = hours?.[key]
    const range = toTimeRange(day)
    if (!range) return []
    const text =
      day?.mode === 'open24'
        ? 'Otwarte całą dobę'
        : day?.mode === 'closed'
          ? 'Nieczynne'
          : `${range[0]}–${range[1]}`
    return [{day: label, hours: text}]
  })

export const toOpeningHoursSpecification = (
  hours: OpeningHours | null | undefined,
): OpeningHoursSpecification[] | undefined => {
  const groups = new Map<string, OpeningHoursSpecification>()

  for (const {key, schemaDay} of DAYS) {
    const range = toTimeRange(hours?.[key])
    if (!range) continue
    const groupKey = range.join('-')
    const group = groups.get(groupKey)
    if (group) {
      group.dayOfWeek.push(schemaDay)
    } else {
      groups.set(groupKey, {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [schemaDay],
        'opens': range[0],
        'closes': range[1],
      })
    }
  }

  return groups.size > 0 ? [...groups.values()] : undefined
}
