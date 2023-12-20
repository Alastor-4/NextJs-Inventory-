
import WorkersMainTable from "./components/WorkersMainTable";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { prisma } from "db";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;

    const roles = await prisma.roles.findMany()
    const ownerUsageRoles = roles.filter(item => item.name === "store_keeper" || item.name === "store_seller")

    return (
        <main>
            <WorkersMainTable roles={ownerUsageRoles} userId={userId} />
        </main>
    )
}