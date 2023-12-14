import UserWarehouseMainTable from "@/app/inventory/warehouse/[warehouseId]/components/UserWarehouseMainTable";
import { prisma } from "db";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function Page({ params }: { params: { warehouseId: string } }) {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id

    const warehouseId = params.warehouseId
    const warehouseDetails = await prisma.warehouses.findFirst({ where: { id: parseInt(warehouseId) } })

    return (
        <main>
            <UserWarehouseMainTable ownerId={userId} warehouseDetails={warehouseDetails} />
        </main>
    )
}