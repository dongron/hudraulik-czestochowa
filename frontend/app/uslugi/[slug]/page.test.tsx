import {describe, expect, it, vi} from 'vitest'

import {generateMetadata} from '@/app/uslugi/[slug]/page'

// The route imports the Sanity client config, which throws without these.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test-project'
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'test'
})

const {sanityFetch} = vi.hoisted(() => ({sanityFetch: vi.fn()}))

vi.mock('@/sanity/lib/live', () => ({sanityFetch}))

describe('service page metadata', () => {
  it('declares the service URL as canonical', async () => {
    sanityFetch.mockResolvedValue({data: {name: 'Naprawa kranu', seoTitle: null}})

    const metadata = await generateMetadata({params: Promise.resolve({slug: 'naprawa-kranu'})})

    expect(metadata.alternates?.canonical).toBe('/uslugi/naprawa-kranu')
  })
})
