import WarehousesForm from "../components/WarehousesForm";
import { prisma } from "db";

export default async function Page() {
    const ownerUsers = await prisma.roles.findUnique({ where: { name: "store_owner" }, include: { users: true } });

    return (
        <main>
            <WarehousesForm ownerUsers={ownerUsers?.users ?? []} />
        </main>
    )
}