import UsersMainTable from "./components/UsersMainTable";
import { prisma } from "db";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id

    const roles = await prisma.roles.findMany();

    return (
        <main>
            <UsersMainTable roles={roles} userId={userId} />
        </main>
    )
}