import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'

export const metadata: Metadata = {
  title: 'Classroom & Meeting Room Management',
  description: 'School room booking and learning management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 font-sans antialiased text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
