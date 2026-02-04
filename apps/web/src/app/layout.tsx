import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingSupportButton } from '@/components/ui/FloatingSupportButton'
import { AnalyticsTracker } from '@/components/analytics/Tracker'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { PWAInstaller } from '@/components/pwa/PWAInstaller'
import Script from 'next/script'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#1A5632',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Africa of Our Dream Education Initiative (AODI) — Building Africa\'s Next Generation of Leaders',
  description: 'AODI is a globally governed leadership and talent development institution supporting high-potential students and early-career professionals across Africa through structured programs, mentorship, and partnerships.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AODI',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Africa of Our Dream Education Initiative (AODI)',
    description: 'Building Africa\'s Next Generation of Leaders',
    type: 'website',
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "Africa of Our Dream Education Initiative",
  "alternateName": "AODI",
  "url": "https://africaofourdreaminitiative.org",
  "logo": "https://africaofourdreaminitiative.org/images/aodi-logo.png",
  "description": "A globally governed leadership and talent development institution supporting high-potential students and early-career professionals across Africa through structured programs, mentorship, and partnerships.",
  "foundingDate": "2020",
  "areaServed": {
    "@type": "Continent",
    "name": "Africa"
  },
  "nonprofitStatus": "Registered in England and Wales",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "aodi.info@africaofourdreaminitiative.org",
    "contactType": "General Inquiries"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Note: Built-in analytics is active via AnalyticsTracker component below.
            Google Analytics is optional and only loads if NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
            The built-in analytics provides: real-time tracking, geographic data, conversion tracking,
            acquisition channels, and is fully GDPR-compliant without third-party data sharing. */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('consent', 'default', {
                  'analytics_storage': 'granted'
                });
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingSupportButton />
          <Suspense fallback={null}>
            <ServiceWorkerRegistration />
            <PWAInstaller />
          </Suspense>
        </div>
      </body>
    </html>
  )
}
