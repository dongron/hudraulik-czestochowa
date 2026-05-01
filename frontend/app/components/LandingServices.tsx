import type {LandingPageQueryResult} from '@/sanity.types'

type ServicesBlock = Extract<
  NonNullable<NonNullable<LandingPageQueryResult>['pageBuilder']>[number],
  {_type: 'servicesSection'}
>

type Props = {
  block: ServicesBlock
}

const CATEGORY_LABELS: Record<string, string> = {
  naprawy: 'Naprawy',
  montaze: 'Montaże',
  czyszczenie: 'Czyszczenie',
}

const CATEGORY_ORDER: Array<'naprawy' | 'montaze' | 'czyszczenie'> = [
  'naprawy',
  'montaze',
  'czyszczenie',
]

export default function LandingServices({block}: Props) {
  const services = block.services || []
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: services.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <section id="uslugi" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {block.heading}
          </h2>
          {block.subheading && (
            <p className="text-lg text-gray-600">{block.subheading}</p>
          )}
        </div>

        <div className="space-y-12">
          {grouped.map((group) => (
            <div key={group.category}>
              <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-6 border-l-4 border-blue-600 pl-3">
                {group.label}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((service) => (
                  <li
                    key={service._key}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-5 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
