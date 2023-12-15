import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import WarehousesForm from "../../components/WarehousesForm";
import { getServerSession } from "next-auth";
import { prisma } from "db";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;

    const ownerUsers = await prisma.roles.findUnique({ where: { name: "store_owner" }, include: { users: true } })

    return (
        <main>
            <WarehousesForm ownerUsers={ownerUsers?.users ?? []} userId={userId} />
        </main>
    )
}