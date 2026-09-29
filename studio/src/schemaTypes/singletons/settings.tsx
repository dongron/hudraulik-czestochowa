import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'
import type {Link, Settings} from '../../../sanity.types'

import * as demo from '../../lib/initialValues'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your blog.',
      title: 'Title',
      type: 'string',
      initialValue: demo.title,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      description: 'Used on the Homepage',
      title: 'Description',
      type: 'array',
      initialValue: demo.description,
      of: [
        // Define a minified block content field for the description. https://www.sanity.io/docs/block-content
        defineArrayMember({
          type: 'block',
          options: {},
          styles: [],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'linkType',
                    title: 'Link Type',
                    type: 'string',
                    initialValue: 'href',
                    options: {
                      list: [
                        {title: 'URL', value: 'href'},
                        {title: 'Page', value: 'page'},
                        {title: 'Post', value: 'post'},
                      ],
                      layout: 'radio',
                    },
                  }),
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    hidden: ({parent}) => parent?.linkType !== 'href' && parent?.linkType != null,
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'href' && !value) {
                          return 'URL is required when Link Type is URL'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'page',
                    title: 'Page',
                    type: 'reference',
                    to: [{type: 'page'}],
                    hidden: ({parent}) => parent?.linkType !== 'page',
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'page' && !value) {
                          return 'Page reference is required when Link Type is Page'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'post',
                    title: 'Post',
                    type: 'reference',
                    to: [{type: 'post'}],
                    hidden: ({parent}) => parent?.linkType !== 'post',
                    validation: (Rule) =>
                      Rule.custom((value, context) => {
                        const parent = context.parent as Link
                        if (parent?.linkType === 'post' && !value) {
                          return 'Post reference is required when Link Type is Post'
                        }
                        return true
                      }),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    title: 'Open in new tab',
                    type: 'boolean',
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        }),
      ],
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      description: 'E.164 format, e.g. +48518893308',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'street',
          title: 'Street',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'postalCode',
          title: 'Postal code',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      description:
        'Public address of this site, e.g. https://hydraulik-czestochowa-24.pl/. Must match the website set in the Google Business Profile.',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'emergencyAvailable',
      title: 'Emergency available (nights, Mon–Sat)',
      description:
        'Shows the emergency badge and note. Their wording is fixed in code and assumes Mon–Sat round-the-clock service; change the code if the opening hours change.',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening hours',
      description:
        'Shown in the contact section and published to search engines. Keep identical to the Google Business Profile.',
      type: 'object',
      options: {collapsible: true, collapsed: false},
      initialValue: {
        monday: {mode: 'open24'},
        tuesday: {mode: 'open24'},
        wednesday: {mode: 'open24'},
        thursday: {mode: 'open24'},
        friday: {mode: 'open24'},
        saturday: {mode: 'open24'},
        sunday: {mode: 'closed'},
      },
      fields: [
        defineField({
          name: 'monday',
          title: 'Poniedziałek',
          type: 'dayHours',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'tuesday',
          title: 'Wtorek',
          type: 'dayHours',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'wednesday',
          title: 'Środa',
          type: 'dayHours',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'thursday',
          title: 'Czwartek',
          type: 'dayHours',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'friday',
          title: 'Piątek',
          type: 'dayHours',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'saturday',
          title: 'Sobota',
          type: 'dayHours',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'sunday',
          title: 'Niedziela',
          type: 'dayHours',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Displayed on social cards and search engine results.',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        defineField({
          name: 'alt',
          description: 'Important for accessibility and SEO.',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => {
            return rule.custom((alt, context) => {
              const document = context.document as Settings
              if (document?.ogImage?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        }),
        defineField({
          name: 'metadataBase',
          type: 'url',
          description: (
            <a
              href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase"
              rel="noreferrer noopener"
            >
              More information
            </a>
          ),
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
      }
    },
  },
})
