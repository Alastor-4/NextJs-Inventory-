import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import UsersMainTable from "./components/UsersMainTable";
import { getServerSession } from "next-auth";
import { roles } from "@prisma/client";
import { prisma } from "db";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);
    const userId = +session?.user.id!

    const roles: roles[] | null = await prisma.roles.findMany();

    return (
        <main>
            <UsersMainTable roles={roles} userId={userId} />
        </main>
    )
}