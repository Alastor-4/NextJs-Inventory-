import './globals.css'
import type { Metadata } from 'next'
import { Roboto_Serif } from 'next/font/google'
import ClientLayout from "@/app/clientLayout"
import { Analytics } from '@vercel/analytics/react'
import { AxiomWebVitals } from 'next-axiom'
// import SessionAuthProvider from '@/providers/SessionAuthProvider';
// import SnackBarContextProvider from '@/providers/SnackbarProvider';

const roboto = Roboto_Serif({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inventario+',
  description: 'Inventario y ventas online',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`p-4 ${roboto.className}`}>
        {/* <SessionAuthProvider> */}
        {/* <SnackBarContextProvider> */}
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
        <AxiomWebVitals />
        {/* </SnackBarContextProvider> */}
        {/* </SessionAuthProvider> */}
      </body>
    </html>
  )
}
