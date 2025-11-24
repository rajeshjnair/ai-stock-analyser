import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AI Stock Analyser - Intelligent Market Analysis',
  description: 'Advanced AI-powered stock analysis platform. Get real-time insights, predictive analytics, and comprehensive market data to make informed investment decisions.',
  keywords: 'AI stock analysis, stock market, investment tools, financial analysis, market insights, trading platform',
  authors: [{ name: 'AI Stock Analyser Team' }],
  openGraph: {
    title: 'AI Stock Analyser - Intelligent Market Analysis',
    description: 'Advanced AI-powered stock analysis platform for informed investment decisions.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Stock Analyser - Intelligent Market Analysis',
    description: 'Advanced AI-powered stock analysis platform for informed investment decisions.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
