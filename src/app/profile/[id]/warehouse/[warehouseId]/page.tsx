import UserWarehouseMainTable from "@/app/profile/[id]/warehouse/[warehouseId]/components/UserWarehouseMainTable";
import {prisma} from "db";

export default async function Page({ params }) {
    const warehouseId = params.warehouseId
    const warehouseDetails = await prisma.warehouses.findFirst({where: {id: parseInt(warehouseId)}})

    return (
        <main>
            <UserWarehouseMainTable ownerId={params.id} warehouseDetails={warehouseDetails}/>
        </main>
    )
}