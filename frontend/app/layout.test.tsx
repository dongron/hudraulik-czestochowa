import {isValidElement, type ReactElement, type ReactNode} from 'react'
import {Toaster} from 'sonner'
import {beforeEach, describe, expect, it, vi} from 'vitest'

import {handleError} from '@/app/client-utils'
import RootLayout from '@/app/layout'

// The layout imports the Sanity client config, which throws without these.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test-project'
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'test'
})

const {draftMode, sanityFetch, SanityLive} = vi.hoisted(() => ({
  draftMode: vi.fn(),
  sanityFetch: vi.fn(),
  SanityLive: vi.fn(() => null),
}))

vi.mock('next/headers', () => ({draftMode}))
vi.mock('next/font/google', () => ({
  Inter: () => ({variable: 'font-inter'}),
  IBM_Plex_Mono: () => ({variable: 'font-ibm-plex-mono'}),
}))
vi.mock('@/sanity/lib/live', () => ({sanityFetch, SanityLive}))
// Its client component imports `next/dynamic`, which does not resolve under Vitest.
vi.mock('next-sanity/visual-editing', () => ({VisualEditing: () => null}))

type Element = ReactElement<{children?: ReactNode; [prop: string]: unknown}>

// Walks the element tree RootLayout returns, without rendering any components.
function findElement(node: ReactNode, type: unknown, ancestors: Element[] = []): Element[] | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, type, ancestors)
      if (found) return found
    }
    return null
  }
  if (!isValidElement(node)) return null
  const element = node as Element
  if (element.type === type) return [...ancestors, element]
  return findElement(element.props.children, type, [...ancestors, element])
}

async function renderLayout(isDraftMode: boolean) {
  draftMode.mockResolvedValue({isEnabled: isDraftMode})
  return RootLayout({children: null})
}

describe('RootLayout Sanity Live errors', () => {
  beforeEach(() => {
    sanityFetch.mockResolvedValue({data: null})
  })

  it('leaves onError to the console-only default outside Draft Mode', async () => {
    const path = findElement(await renderLayout(false), SanityLive)

    expect(path).not.toBeNull()
    expect(path!.at(-1)!.props.onError).toBeUndefined()
  })

  it('shows error toasts in Draft Mode', async () => {
    const path = findElement(await renderLayout(true), SanityLive)

    expect(path!.at(-1)!.props.onError).toBe(handleError)
  })

  it('keeps toast text out of Google snippets', async () => {
    const path = findElement(await renderLayout(false), Toaster)

    expect(path).not.toBeNull()
    expect(path!.some((element) => 'data-nosnippet' in element.props)).toBe(true)
  })
})
