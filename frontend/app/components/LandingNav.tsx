import Link from 'next/link'

import type {SettingsQueryResult} from '@/sanity.types'

type Props = {
  settings: SettingsQueryResult
}

const NAV_LINKS = [
  {href: '#uslugi', label: 'Usługi'},
  {href: '#opinie', label: 'Opinie'},
  {href: '#o-mnie', label: 'O mnie'},
  {href: '#kontakt', label: 'Kontakt'},
]

export default function LandingNav({settings}: Props) {
  const phone = settings?.phone
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="#top" className="font-bold text-lg tracking-tight text-gray-900">
          {settings?.title || 'Usługi Hydrauliczne'}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {phoneHref && (
          <a
            href={phoneHref}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            aria-label={`Zadzwoń ${phone}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
            </svg>
            <span className="hidden sm:inline">{phone}</span>
            <span className="sm:hidden">Zadzwoń</span>
          </a>
        )}
      </div>
    </header>
  )
}
