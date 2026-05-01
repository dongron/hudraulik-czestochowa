import type {LandingPageQueryResult, SettingsQueryResult} from '@/sanity.types'

type HeroBlock = Extract<
  NonNullable<NonNullable<LandingPageQueryResult>['pageBuilder']>[number],
  {_type: 'heroSection'}
>

type Props = {
  block: HeroBlock
  settings: SettingsQueryResult
}

export default function LandingHero({block, settings}: Props) {
  const phone = settings?.phone
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined
  const emergency = settings?.emergencyAvailable

  return (
    <section
      id="top"
      className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 md:py-24 lg:py-32"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {block.eyebrow && (
            <p className="text-sm md:text-base font-semibold uppercase tracking-wider text-blue-600 mb-4">
              {block.eyebrow}
            </p>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            {block.heading}
          </h1>

          {block.subheading && (
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              {block.subheading}
            </p>
          )}

          {emergency && (
            <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Pogotowie 24/7 — noce i weekendy
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {phoneHref && (
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
                </svg>
                {block.ctaLabel}
              </a>
            )}
            <a
              href="#kontakt"
              className="inline-flex items-center justify-center rounded-md bg-white border border-gray-300 px-6 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Napisz wiadomość
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
