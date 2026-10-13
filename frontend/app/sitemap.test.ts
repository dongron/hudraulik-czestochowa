import {beforeEach, describe, expect, it, vi} from 'vitest'

import sitemap from '@/app/sitemap'

const {sanityFetch} = vi.hoisted(() => ({sanityFetch: vi.fn()}))

vi.mock('@/sanity/lib/live', () => ({sanityFetch}))

beforeEach(() => {
  sanityFetch.mockResolvedValue({
    data: [
      {slug: 'home', _type: 'page', _updatedAt: '2026-09-29T10:23:01Z'},
      {slug: 'naprawa-kranu', _type: 'service', _updatedAt: '2026-10-02T13:25:48Z'},
    ],
  })
})

describe('sitemap', () => {
  it('lists every URL as an absolute https URL on the production domain', async () => {
    const entries = await sitemap()

    for (const entry of entries) {
      expect(entry.url).toMatch(/^https:\/\/hydraulik-czestochowa-24\.pl(\/|$)/)
    }
  })

  it('lists the home page document once, as the site root', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain('https://hydraulik-czestochowa-24.pl')
    expect(urls).not.toContain('https://hydraulik-czestochowa-24.pl/home')
  })

  it('lists service pages under /uslugi', async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain('https://hydraulik-czestochowa-24.pl/uslugi/naprawa-kranu')
  })

  it('never lists posts', async () => {
    sanityFetch.mockResolvedValue({
      data: [{slug: 'why-sanity-wins', _type: 'post', _updatedAt: '2026-04-30T18:55:30Z'}],
    })

    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls.some((url) => url.includes('/posts/'))).toBe(false)
  })
})
