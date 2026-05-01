import type {SettingsQueryResult} from '@/sanity.types'

type Props = {
  settings: SettingsQueryResult
}

export default function LandingFooter({settings}: Props) {
  const phone = settings?.phone
  const phoneHref = phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined
  const address = settings?.address
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div>
            <p className="font-bold text-white text-lg mb-2">
              {settings?.title || 'Usługi Hydrauliczne'}
            </p>
            <p className="text-sm text-gray-400">
              Profesjonalne usługi hydrauliczne w Częstochowie i okolicach.
            </p>
          </div>

          <div>
            <p className="font-semibold text-white mb-2">Kontakt</p>
            {phoneHref && (
              <a href={phoneHref} className="block text-gray-300 hover:text-white">
                {phone}
              </a>
            )}
            {address && (
              <address className="not-italic text-sm text-gray-400 mt-2">
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </address>
            )}
          </div>

          <div>
            <p className="font-semibold text-white mb-2">Nawigacja</p>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="#uslugi" className="text-gray-300 hover:text-white">
                  Usługi
                </a>
              </li>
              <li>
                <a href="#opinie" className="text-gray-300 hover:text-white">
                  Opinie
                </a>
              </li>
              <li>
                <a href="#o-mnie" className="text-gray-300 hover:text-white">
                  O mnie
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-gray-300 hover:text-white">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          © {year} {settings?.title || 'Usługi Hydrauliczne'}. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  )
}
