'use client';
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    if (!session) {
        redirect('/');
    }

    return (
        <div>
            {children}
        </div>
    )
}
