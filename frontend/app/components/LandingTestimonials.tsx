import type {LandingPageQueryResult} from '@/sanity.types'

type TestimonialsBlock = Extract<
  NonNullable<NonNullable<LandingPageQueryResult>['pageBuilder']>[number],
  {_type: 'testimonialsSection'}
>

type Props = {
  block: TestimonialsBlock
}

function Stars({rating}: {rating: number}) {
  const safe = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <div className="flex gap-0.5" aria-label={`Ocena ${safe} z 5`}>
      {Array.from({length: 5}).map((_, i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-5 h-5 ${i < safe ? 'text-yellow-400' : 'text-gray-300'}`}
          aria-hidden="true"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  )
}

export default function LandingTestimonials({block}: Props) {
  return (
    <section id="opinie" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 mb-4">
            {block.yearsExperience}+ lat doświadczenia
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {block.heading}
          </h2>
          {block.subheading && (
            <p className="text-lg text-gray-600">{block.subheading}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {block.testimonials.map((t) => (
            <figure
              key={t._key}
              className="flex flex-col rounded-lg bg-white p-6 shadow-sm border border-gray-200"
            >
              <Stars rating={t.rating} />
              <blockquote className="mt-4 flex-grow">
                <p className="text-gray-700 italic">&bdquo;{t.text}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-4 pt-4 border-t border-gray-100 font-semibold text-gray-900">
                {t.authorName}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
