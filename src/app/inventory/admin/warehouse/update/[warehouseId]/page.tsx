import WarehousesForm from "../../components/WarehousesForm";
import { prisma } from "db";
import {getServerSession} from "next-auth";
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id

    const ownerUsers = await prisma.roles.findUnique({ where: { name: "store_owner" }, include: { users: true } })

    return (
        <main>
            <WarehousesForm ownerUsers={ownerUsers?.users ?? []} userId={userId}/>
        </main>
    )
}