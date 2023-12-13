import UserWarehouseForm from "@/app/inventory/warehouse/[warehouseId]/components/UserWarehouseForm";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function Page({ params }: { params: { warehouseId: string } }) {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id
    const warehouseId = params.warehouseId

    return (
        <main>
            <UserWarehouseForm ownerId={userId} warehouseId={warehouseId} />
        </main>
    )
}