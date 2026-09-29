import {toOpeningHoursSpecification} from '@/app/lib/openingHours'
import type {SettingsQueryResult} from '@/sanity.types'

type Props = {
  settings: SettingsQueryResult
}

export default function LocalBusinessSchema({settings}: Props) {
  if (!settings) return null

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    'name': settings.title || 'Usługi Hydrauliczne',
    'telephone': settings.phone,
    'address': settings.address
      ? {
          '@type': 'PostalAddress',
          'streetAddress': settings.address.street,
          'addressLocality': settings.address.city,
          'postalCode': settings.address.postalCode,
          'addressCountry': 'PL',
        }
      : undefined,
    'areaServed': settings.address?.city,
    // The site itself is the business website; the Maps link identifies the same
    // business on Google. Both help Google tie this page to the Business Profile.
    'url': settings.websiteUrl || undefined,
    'hasMap': settings.googleMapsUrl || undefined,
    'openingHoursSpecification': toOpeningHoursSpecification(settings.openingHours),
  }

  // JSON.stringify does not escape "<", so a CMS value containing "</script>" could
  // break out of the tag. The escaped form "\u003c" parses back to "<".
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: json}} />
}
