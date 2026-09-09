import type { Metadata } from 'next'
import { RootLayoutClient } from './layout-client'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Travel Management Hub',
  description: 'Angels Resource Centres Travel Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}
