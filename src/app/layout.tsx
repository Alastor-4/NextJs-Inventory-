import './globals.css'
import type { Metadata } from 'next'
import { Roboto_Serif } from 'next/font/google'
import ClientLayout from "@/app/clientLayout";

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
      <body className={`p-4 ${roboto.className}`}>
      <ClientLayout>
          {children}
      </ClientLayout>
      </body>
    </html>
  )
}
