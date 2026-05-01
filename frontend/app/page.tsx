import {notFound} from 'next/navigation'

import LandingAbout from '@/app/components/LandingAbout'
import LandingContact from '@/app/components/LandingContact'
import LandingFooter from '@/app/components/LandingFooter'
import LandingHero from '@/app/components/LandingHero'
import LandingNav from '@/app/components/LandingNav'
import LandingServices from '@/app/components/LandingServices'
import LandingTestimonials from '@/app/components/LandingTestimonials'
import LocalBusinessSchema from '@/app/components/LocalBusinessSchema'
import {sanityFetch} from '@/sanity/lib/live'
import {landingPageQuery, settingsQuery} from '@/sanity/lib/queries'

export default async function Page() {
  const [{data: page}, {data: settings}] = await Promise.all([
    sanityFetch({query: landingPageQuery}),
    sanityFetch({query: settingsQuery}),
  ])

  if (!page) {
    return notFound()
  }

  return (
    <>
      <LocalBusinessSchema settings={settings} />
      <LandingNav settings={settings} />
      <main>
        {page.pageBuilder?.map((block) => {
          switch (block._type) {
            case 'heroSection':
              return <LandingHero key={block._key} block={block} settings={settings} />
            case 'servicesSection':
              return <LandingServices key={block._key} block={block} />
            case 'testimonialsSection':
              return <LandingTestimonials key={block._key} block={block} />
            case 'aboutSection':
              return <LandingAbout key={block._key} block={block} />
            case 'contactSection':
              return <LandingContact key={block._key} block={block} settings={settings} />
            default:
              return null
          }
        })}
      </main>
      <LandingFooter settings={settings} />
    </>
  )
}
