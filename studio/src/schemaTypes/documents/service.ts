import {defineArrayMember, defineField, defineType} from 'sanity'
import {WrenchIcon} from '@sanity/icons'

const CATEGORY_LABELS: Record<string, string> = {
  naprawy: 'Naprawy',
  montaze: 'Montaże',
  czyszczenie: 'Czyszczenie',
}

/**
 * Service schema. Each service is a standalone, content-managed page listed
 * automatically in the home-page "Usługi" section and rendered at /uslugi/<slug>.
 */
export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: WrenchIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Service name; used as the card title and page H1.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      validation: (rule) => rule.required(),
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
      name: 'cardDescription',
      title: 'Card description',
      type: 'string',
      description: 'Short blurb shown on the card in the Usługi section.',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Optional manual sort within a category; lower = earlier. Fallback: name asc.',
    }),
    defineField({
      name: 'heroIntro',
      title: 'Hero intro',
      type: 'text',
      description: 'Intro paragraph shown under the H1 on the service page.',
    }),
    defineField({
      name: 'image',
      title: 'Hero image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'imageAlt',
      title: 'Hero image alt text',
      type: 'string',
      description: 'Important for accessibility and SEO.',
    }),
    defineField({
      name: 'priceFrom',
      title: 'Price from',
      type: 'string',
      description: 'Polish-formatted "from" price, e.g. "od 120 zł".',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          title: 'Question',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'question', subtitle: 'answer'},
          },
        }),
      ],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description:
        'Optional <title> override; fallback "<name> – Usługi Hydrauliczne Częstochowa".',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'string',
      description: 'Optional meta description; fallback to card description / hero intro.',
    }),
  ],
  preview: {
    select: {title: 'name', category: 'category', media: 'image'},
    prepare({title, category, media}) {
      return {
        title: title || 'Service',
        subtitle: CATEGORY_LABELS[category as string] || category,
        media,
      }
    },
  },
})
