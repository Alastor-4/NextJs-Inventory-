import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import React from "react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(nextAuthOptions);

    if (session?.user.role_id !== 1) {
        redirect('/inventory');
    }

    return (<>{children}</>);
}