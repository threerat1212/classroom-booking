import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'

export const metadata: Metadata = {
  title: {
    default: 'Classroom & Meeting Room Management',
    template: '%s · Classroom MS',
  },
  description: 'School room booking and learning management system',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased text-slate-950 selection:bg-blue-200 selection:text-blue-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
