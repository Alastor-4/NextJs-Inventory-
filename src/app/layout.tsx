import './globals.css'
import type {Metadata} from 'next'
import {Roboto_Serif} from 'next/font/google'
import ClientLayout from "@/app/clientLayout"
import {Analytics} from '@vercel/analytics/react'
import {AxiomWebVitals} from 'next-axiom'
import NextTopLoader from 'nextjs-toploader'
// import SessionAuthProvider from '@/providers/SessionAuthProvider';
// import SnackBarContextProvider from '@/providers/SnackbarProvider';

const roboto = Roboto_Serif({subsets: ['latin']})

export const metadata: Metadata = {
    title: 'Inventario Plus',
    description: 'Inventario y Ventas Online',
    manifest: "/manifest.json",
    generator: "Next.js",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={roboto.className}>
        {/* <SessionAuthProvider> */}
        {/* <SnackBarContextProvider> */}
        <NextTopLoader color="#fff" height={4}/>
        <ClientLayout>
            {children}
        </ClientLayout>
        <Analytics/>
        <AxiomWebVitals/>
        {/* </SnackBarContextProvider> */}
        {/* </SessionAuthProvider> */}
        </body>
        </html>
    )
}
