import {defineField, defineType} from 'sanity'
import {WrenchIcon} from '@sanity/icons'

export const servicesSection = defineType({
  name: 'servicesSection',
  title: 'Services Section',
  type: 'object',
  icon: WrenchIcon,
  description:
    'Services are managed as individual Service documents and listed here automatically, grouped by category.',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {
        title: title || 'Services',
        subtitle: 'Services Section',
      }
    },
  },
})
