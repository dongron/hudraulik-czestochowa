import Image from 'next/image'
import {PortableText} from 'next-sanity'

import {urlForImage} from '@/sanity/lib/utils'
import type {LandingPageQueryResult} from '@/sanity.types'

type AboutBlock = Extract<
  NonNullable<NonNullable<LandingPageQueryResult>['pageBuilder']>[number],
  {_type: 'aboutSection'}
>

type Props = {
  block: AboutBlock
}

export default function LandingAbout({block}: Props) {
  const photoUrl = block.photo?.asset
    ? urlForImage(block.photo)?.width(800).height(800).fit('crop').url()
    : null

  return (
    <section id="o-mnie" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {photoUrl && (
            <div className="order-1 md:order-1">
              <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={photoUrl}
                  alt={block.photoAlt || block.heading}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(min-width: 768px) 400px, 100vw"
                />
              </div>
            </div>
          )}

          <div className={photoUrl ? 'order-2 md:order-2' : 'col-span-full'}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {block.heading}
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-none">
              <PortableText value={block.body} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
