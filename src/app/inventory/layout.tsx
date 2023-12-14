import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(nextAuthOptions);

    if (!session) {
        redirect('/');
    }

    return (<>{children}</>);
}
