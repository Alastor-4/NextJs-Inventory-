import './globals.css'
import type { Metadata } from 'next'
import { Roboto_Serif } from 'next/font/google'
import ClientLayout from "@/app/clientLayout";
// import SessionAuthProvider from '@/providers/SessionAuthProvider';
// import SnackBarContextProvider from '@/providers/SnackbarProvider';

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
        {/* <SessionAuthProvider> */}
        {/* <SnackBarContextProvider> */}
        <ClientLayout>
          {children}
        </ClientLayout>
        {/* </SnackBarContextProvider> */}
        {/* </SessionAuthProvider> */}
      </body>
    </html>
  )
}
