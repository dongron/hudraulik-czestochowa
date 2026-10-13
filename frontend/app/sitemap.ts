import {MetadataRoute} from 'next'
import {SITE_URL} from '@/app/lib/site'
import {sanityFetch} from '@/sanity/lib/live'
import {sitemapData} from '@/sanity/lib/queries'

/**
 * This file creates a sitemap (sitemap.xml) for the application. Learn more about sitemaps in Next.js here: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 * Be sure to update the `changeFrequency` and `priority` values to match your application's content.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allPostsAndPages = await sanityFetch({
    query: sitemapData,
  })
  const sitemap: MetadataRoute.Sitemap = []
  sitemap.push({
    url: SITE_URL,
    lastModified: new Date(),
    priority: 1,
    changeFrequency: 'monthly',
  })

  if (allPostsAndPages != null && allPostsAndPages.data.length != 0) {
    let priority: number
    let changeFrequency:
      | 'monthly'
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'yearly'
      | 'never'
      | undefined
    let url: string

    for (const p of allPostsAndPages.data) {
      // The "home" page document is rendered at the site root, which is already listed.
      if (p._type === 'page' && p.slug === 'home') continue
      // Posts are hidden: the site has no blog (spec 007, D3).
      if (p._type === 'post') continue

      switch (p._type) {
        case 'page':
          priority = 0.8
          changeFrequency = 'monthly'
          url = `${SITE_URL}/${p.slug}`
          break
        case 'service':
          priority = 0.7
          changeFrequency = 'monthly'
          url = `${SITE_URL}/uslugi/${p.slug}`
          break
      }
      sitemap.push({
        lastModified: p._updatedAt || new Date(),
        priority,
        changeFrequency,
        url,
      })
    }
  }

  return sitemap
}
