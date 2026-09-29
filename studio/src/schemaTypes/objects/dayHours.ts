import {defineField, defineType} from 'sanity'
import {ClockIcon} from '@sanity/icons'

type DayHoursValue = {
  mode?: 'open24' | 'closed' | 'hours'
  opens?: string
  closes?: string
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const requiredInHoursMode = (value: string | undefined, parent: DayHoursValue | undefined) => {
  if (parent?.mode !== 'hours') return true
  if (!value) return 'Required when the day has specific hours'
  if (!TIME_PATTERN.test(value)) return 'Use 24-hour HH:MM format, e.g. 08:00'
  return true
}

export const dayHours = defineType({
  name: 'dayHours',
  title: 'Day hours',
  type: 'object',
  icon: ClockIcon,
  options: {columns: 3},
  fields: [
    defineField({
      name: 'mode',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Open 24 hours', value: 'open24'},
          {title: 'Closed', value: 'closed'},
          {title: 'Specific hours', value: 'hours'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'opens',
      title: 'Opens',
      type: 'string',
      placeholder: '08:00',
      hidden: ({parent}) => parent?.mode !== 'hours',
      validation: (rule) =>
        rule.custom((value: string | undefined, context) =>
          requiredInHoursMode(value, context.parent as DayHoursValue),
        ),
    }),
    defineField({
      name: 'closes',
      title: 'Closes',
      type: 'string',
      placeholder: '16:00',
      hidden: ({parent}) => parent?.mode !== 'hours',
      validation: (rule) =>
        rule.custom((value: string | undefined, context) => {
          const parent = context.parent as DayHoursValue
          const base = requiredInHoursMode(value, parent)
          if (base !== true) return base
          // Zero-padded HH:MM strings compare correctly as strings. Overnight ranges
          // are not supported; use "Open 24 hours" instead.
          if (parent?.mode === 'hours' && parent.opens && value && value <= parent.opens) {
            return 'Closing time must be later than opening time'
          }
          return true
        }),
    }),
  ],
})
