import type {SettingsQueryResult} from '@/sanity.types'

type Props = {
  settings: SettingsQueryResult
}

export default function LocalBusinessSchema({settings}: Props) {
  if (!settings) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: settings.title || 'Usługi Hydrauliczne',
    telephone: settings.phone,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address.street,
          addressLocality: settings.address.city,
          postalCode: settings.address.postalCode,
          addressCountry: 'PL',
        }
      : undefined,
    areaServed: settings.address?.city,
    url: settings.googleMapsUrl,
    openingHoursSpecification: settings.emergencyAvailable
      ? {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        }
      : undefined,
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  )
}
