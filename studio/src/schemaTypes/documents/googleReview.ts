import {defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons'

import {isShortReviewerName} from '../../lib/reviewerName'

/**
 * A customer review copied from the business's Google Business Profile.
 * Text and rating are verbatim; the reviewer is stored only as "First L." (spec 007).
 * The home-page testimonials section picks which reviews to show.
 */
export const googleReview = defineType({
  name: 'googleReview',
  title: 'Google Review',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'authorName',
      title: 'Author name',
      type: 'string',
      description: 'First name and first letter of the last name only, e.g. "Angelika K."',
      validation: (rule) =>
        rule
          .required()
          .custom((name) =>
            !name || isShortReviewerName(name)
              ? true
              : 'Podaj tylko imię i pierwszą literę nazwiska, np. Angelika K.',
          ),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 4,
      description: 'Exactly as written on Google. Do not edit.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviewDate',
      title: 'Review date',
      type: 'date',
    }),
    defineField({
      name: 'googleReviewId',
      title: 'Google review ID',
      type: 'string',
      readOnly: true,
      description: 'Set by the reviews import. Empty for reviews entered by hand.',
    }),
  ],
  preview: {
    select: {title: 'authorName', rating: 'rating', subtitle: 'text'},
    prepare({title, rating, subtitle}) {
      const stars = rating ? '★'.repeat(rating) : ''
      return {title: [title, stars].filter(Boolean).join(' '), subtitle}
    },
  },
})
