import {beforeEach, describe, expect, it, vi} from 'vitest'

import Page, {generateMetadata} from '@/app/[slug]/page'

// The route imports the Sanity client config, which throws without these.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test-project'
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'test'
})

const {sanityFetch} = vi.hoisted(() => ({sanityFetch: vi.fn()}))

vi.mock('@/sanity/lib/live', () => ({sanityFetch}))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

const propsFor = (slug: string) => ({params: Promise.resolve({slug})})

beforeEach(() => {
  sanityFetch.mockReset()
})

describe('[slug] page', () => {
  // Unknown slugs used to render the template onboarding screen with a 200,
  // so Google saw every mistyped URL as a real, empty page (soft 404).
  it('responds with not found when no page matches the slug', async () => {
    sanityFetch.mockResolvedValue({data: null})

    await expect(Page(propsFor('nie-ma-takiej-strony'))).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('declares its own URL as canonical', async () => {
    sanityFetch.mockResolvedValue({data: {_id: 'p1', name: 'Cennik', heading: 'Cennik usług'}})

    const metadata = await generateMetadata(propsFor('cennik'))

    expect(metadata.alternates?.canonical).toBe('/cennik')
  })
})
