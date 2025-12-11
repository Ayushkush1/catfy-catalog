import type { Metadata } from 'next'
import {
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Poppins,
  Playfair_Display,
  Merriweather,
} from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { NotificationsProvider } from '@/contexts/NotificationsContext'
import { NotificationsDrawer } from '@/components/dashboard/NotificationsDrawer'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { GlobalSidebar } from '@/components/dashboard/SidebarVisibility'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Optimize font loading
  preload: true,
})
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
  preload: false, // Only preload most used font
})
const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
  preload: false,
})
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
  preload: false,
})
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: false,
})
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
})
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
  preload: false,
})
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'CATFY - AI-Driven Dynamic Catalogues',
  description:
    'Create beautiful, dynamic product catalogues with AI assistance',
  keywords: ['catalogue', 'products', 'AI', 'dynamic', 'SaaS'],
  authors: [{ name: 'CATFY Team' }],
  creator: 'CATFY',
  publisher: 'CATFY',
  icons: {
    icon: '/assets/CATFYLogo.png',
    shortcut: '/assets/CATFYLogo.png',
    apple: '/assets/CATFYLogo.png',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'CATFY - AI-Driven Dynamic Catalogues',
    description:
      'Create beautiful, dynamic product catalogues with AI assistance',
    url: '/',
    siteName: 'CATFY',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/CATFYLogo.png',
        width: 1200,
        height: 630,
        alt: 'CATFY Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CATFY - AI-Driven Dynamic Catalogues',
    description:
      'Create beautiful, dynamic product catalogues with AI assistance',
    creator: '@catfy',
    images: ['/assets/CATFYLogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} ${playfairDisplay.variable} ${merriweather.variable} ${inter.className}`}
      >
        <Providers>
          <NotificationsProvider>
            <GlobalSidebar />
            {children}
            <NotificationsDrawer />
            <Toaster />
            <SonnerToaster position="top-right" richColors />
          </NotificationsProvider>
        </Providers>
      </body>
    </html>
  )
}
