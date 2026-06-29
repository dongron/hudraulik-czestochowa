import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'

import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import {sanityFetch} from '@/sanity/lib/live'
import {serviceQuery, serviceSlugs, settingsQuery} from '@/sanity/lib/queries'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Pre-render a static page per published service.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: serviceSlugs,
    perspective: 'published',
    stega: false,
  })
  return data
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: service} = await sanityFetch({
    query: serviceQuery,
    params,
    stega: false,
  })

  if (!service) {
    return {}
  }

  const title = service.seoTitle || `${service.name} – Usługi Hydrauliczne Częstochowa`
  const description =
    service.seoDescription || service.cardDescription || service.heroIntro || undefined

  return {
    title,
    description,
  } satisfies Metadata
}

export default async function ServicePage(props: Props) {
  const params = await props.params
  const [{data: service}, {data: settings}] = await Promise.all([
    sanityFetch({query: serviceQuery, params}),
    sanityFetch({query: settingsQuery}),
  ])

  if (!service?._id) {
    return notFound()
  }

  const phone = settings?.phone
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined

  return (
    <article className="container mx-auto px-4 py-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {service.name}
        </h1>

        {service.priceFrom && (
          <p className="mt-4 inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-base font-semibold text-blue-700">
            {service.priceFrom}
          </p>
        )}

        {service.heroIntro && (
          <p className="mt-6 text-lg leading-relaxed text-gray-600">{service.heroIntro}</p>
        )}

        {service.image?.asset?._id && (
          <div className="mt-8">
            <Image
              id={service.image.asset._id}
              alt={service.imageAlt || service.name}
              className="w-full rounded-lg"
              width={1024}
              height={538}
              mode="cover"
              hotspot={service.image.hotspot}
              crop={service.image.crop}
            />
          </div>
        )}

        {service.body?.length ? (
          <PortableText
            className="mt-10 prose-headings:font-semibold prose-headings:tracking-tight"
            value={service.body as PortableTextBlock[]}
          />
        ) : null}

        {service.faq?.length ? (
          <section className="mt-12 border-t border-gray-100 pt-10">
            <h2 className="text-2xl font-bold text-gray-900">Najczęściej zadawane pytania</h2>
            <dl className="mt-6 space-y-6">
              {service.faq.map((item) => (
                <div key={item._key}>
                  <dt className="font-semibold text-gray-900">{item.question}</dt>
                  <dd className="mt-2 text-gray-600">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {phoneHref && (
          <div className="mt-12 rounded-lg bg-blue-600 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-white">
              Potrzebujesz pomocy? Zadzwoń i umów wizytę.
            </p>
            <a
              href={phoneHref}
              data-ga-event="phone_call"
              data-ga-section="service-cta"
              data-ga-location={service.slug}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-base font-semibold text-blue-700 transition-colors hover:bg-blue-50"
              aria-label={`Zadzwoń ${phone}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
              </svg>
              {phone}
            </a>
          </div>
        )}
      </div>
    </article>
  )
}
