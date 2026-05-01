import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const aboutSection = defineType({
  name: 'aboutSection',
  title: 'About Section',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContentTextOnly',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'photoAlt',
      title: 'Photo alt text',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'heading', media: 'photo'},
    prepare({title, media}) {
      return {title: title || 'About', subtitle: 'About Section', media}
    },
  },
})
