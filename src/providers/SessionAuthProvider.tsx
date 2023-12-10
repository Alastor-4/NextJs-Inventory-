"use client"

import { SessionProvider } from 'next-auth/react';

interface SessionAuthProviderProps {
    children: React.ReactNode;
}

export default function SessionAuthProvider({ children }: SessionAuthProviderProps) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}