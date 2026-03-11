import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Tell Protocol — The Open Standard for Strategic Intent',
    template: '%s | Tell Protocol',
  },
  description:
    'Tell is an open protocol for encoding strategic intent in a machine-readable format. Define bets, track assumptions, surface evidence. The Git for strategy.',
  keywords: [
    'Tell protocol',
    'strategic intent',
    'open standard',
    'strategy protocol',
    'AI agents',
    'MCP',
    'strategic intelligence',
    'portfolio strategy',
  ],
  openGraph: {
    title: 'Tell Protocol — The Open Standard for Strategic Intent',
    description:
      'An open protocol for encoding strategic intent. Machine-readable. Human-meaningful.',
    type: 'website',
    siteName: 'Tell Protocol',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tell Protocol',
    description:
      'The open standard for encoding strategic intent. The Git for strategy.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-navy-900 antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
