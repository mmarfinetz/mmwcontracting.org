import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MMW Contracting - Revenue Calculator',
  description: 'Revenue calculator for MMW Contracting plumbing services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 