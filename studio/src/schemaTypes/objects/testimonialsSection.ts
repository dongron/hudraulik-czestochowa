import {defineArrayMember, defineField, defineType} from 'sanity'
import {StarIcon} from '@sanity/icons'

export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'object',
  icon: StarIcon,
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
      name: 'yearsExperience',
      title: 'Years of experience',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'reviews',
      title: 'Google reviews',
      description: 'Reviews shown on the page, in this order.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'googleReview'}]})],
      validation: (Rule) => Rule.unique(),
    }),
    defineField({
      name: 'sourceNote',
      title: 'Source note',
      description: 'Shown under the reviews, e.g. "Opinie klientów z naszej wizytówki Google."',
      type: 'string',
    }),
    defineField({
      name: 'sourceLinkLabel',
      title: 'Source link label',
      description: 'Link to the Google profile (Settings → Google Maps URL).',
      type: 'string',
    }),
    // Replaced by `reviews` (spec 007, Part 8). Kept, hidden, until Part 11 removes it.
    defineField({
      name: 'testimonials',
      title: 'Testimonials (old)',
      type: 'array',
      hidden: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonialItem',
          title: 'Testimonial',
          fields: [
            defineField({
              name: 'authorName',
              title: 'Author name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'rating',
              title: 'Rating',
              type: 'number',
              initialValue: 5,
              validation: (Rule) => Rule.required().min(1).max(5).integer(),
            }),
          ],
          preview: {
            select: {title: 'authorName', subtitle: 'text'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading'},
    prepare({title}) {
      return {title: title || 'Testimonials', subtitle: 'Testimonials Section'}
    },
  },
})
