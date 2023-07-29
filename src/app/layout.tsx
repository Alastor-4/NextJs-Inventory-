import './globals.css'
import type { Metadata } from 'next'
import { Roboto_Serif } from 'next/font/google'

const roboto = Roboto_Serif({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inventory',
  description: 'Inventory online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`p-4 ${roboto.className}`}>{children}</body>
    </html>
  )
}
