import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(nextAuthOptions);

    const role_id = session?.user.role_id;

    if (![2, 3].includes(role_id)) {
        redirect('/inventory');
    }

    return (<>{children}</>);
}