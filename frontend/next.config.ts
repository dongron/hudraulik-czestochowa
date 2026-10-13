import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: 'false',
  },
  images: {
    remotePatterns: [new URL('https://cdn.sanity.io/**')],
  },
  async redirects() {
    return [
      // The "home" page document is rendered at the site root, so /home would duplicate it.
      {source: '/home', destination: '/', permanent: true},
    ]
  },
}

export default nextConfig
