import {defineArrayMember, defineField, defineType} from 'sanity'
import {WrenchIcon} from '@sanity/icons'

export const servicesSection = defineType({
  name: 'servicesSection',
  title: 'Services Section',
  type: 'object',
  icon: WrenchIcon,
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
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceItem',
          title: 'Service',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              validation: (Rule) => Rule.required(),
              options: {
                list: [
                  {title: 'Naprawy', value: 'naprawy'},
                  {title: 'Montaże', value: 'montaze'},
                  {title: 'Czyszczenie', value: 'czyszczenie'},
                ],
                layout: 'radio',
              },
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'category'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heading',
      services: 'services',
    },
    prepare({title, services}) {
      const count = Array.isArray(services) ? services.length : 0
      return {
        title: title || 'Services',
        subtitle: `${count} service${count === 1 ? '' : 's'}`,
      }
    },
  },
})
