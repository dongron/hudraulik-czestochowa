import Script from 'next/script'

import {GA_ID} from '@/app/lib/analytics'

/**
 * Loads Google Analytics 4 via gtag.js. Scripts use the `afterInteractive`
 * strategy so they never block first paint. Renders nothing when
 * NEXT_PUBLIC_GA_ID is unset, keeping GA fully inert in dev/preview.
 */
export default function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  )
}
