const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/programs/conferences',
        destination: '/events',
        permanent: true,
      },
      {
        source: '/programs/workshops',
        destination: '/events',
        permanent: true,
      },
      {
        source: '/programs/global-mentorship-leadership',
        destination: '/programs/global-mentorship',
        permanent: true,
      },
      // Form redirects to database-driven dynamic forms
      {
        source: '/get-involved/mentor',
        destination: '/forms/mentor',
        permanent: false,
      },
      {
        source: '/get-involved/mentee',
        destination: '/forms/mentee',
        permanent: false,
      },
      {
        source: '/get-involved/volunteer',
        destination: '/forms/volunteer',
        permanent: false,
      },
      {
        source: '/get-involved/partner',
        destination: '/forms/partner',
        permanent: false,
      },
      {
        source: '/apply/empowerher',
        destination: '/forms/empowerher',
        permanent: false,
      },
      {
        source: '/apply/campus-ambassador',
        destination: '/forms/campus-ambassador',
        permanent: false,
      },
      {
        source: '/apply/stem-workshops',
        destination: '/forms/stem-workshops',
        permanent: false,
      },
      {
        source: '/apply/partner-africa',
        destination: '/forms/partner-africa',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://hcaptcha.com https://*.hcaptcha.com https://*.sentry.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://hcaptcha.com https://*.hcaptcha.com https://*.sentry.io; frame-src https://hcaptcha.com https://*.hcaptcha.com; frame-ancestors 'self';"
          }
        ]
      }
    ]
  }
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}, {
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  disableLogger: true,
})
