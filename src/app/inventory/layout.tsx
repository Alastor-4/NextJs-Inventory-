import { redirect } from "next/navigation";
import React from "react";
import {getServerSession} from "next-auth";
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

export default async function ProtectedLayout({children}: { children: React.ReactNode }) {
    const session = await getServerSession(nextAuthOptions)

    if (!session) {
        redirect('/');
    }

    return (
        <div>
            {children}
        </div>
    )
}
