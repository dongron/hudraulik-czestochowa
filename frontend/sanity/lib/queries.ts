import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const landingPageQuery = defineQuery(`
  *[_type == "page" && slug.current == "home"][0]{
    _id,
    _type,
    name,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "heroSection" => {
        _key,
        _type,
        eyebrow,
        heading,
        subheading,
        ctaLabel,
      },
      _type == "servicesSection" => {
        _key,
        _type,
        heading,
        subheading,
        "services": services[]{
          _key,
          name,
          category,
          description,
        },
      },
      _type == "testimonialsSection" => {
        _key,
        _type,
        heading,
        subheading,
        yearsExperience,
        "testimonials": testimonials[]{
          _key,
          authorName,
          text,
          rating,
        },
      },
      _type == "aboutSection" => {
        _key,
        _type,
        heading,
        body,
        "photo": photo{ asset->, hotspot, crop },
        photoAlt,
      },
      _type == "contactSection" => {
        _key,
        _type,
        heading,
        subheading,
        formEnabled,
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)
