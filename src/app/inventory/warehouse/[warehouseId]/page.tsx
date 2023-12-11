import UserWarehouseMainTable from "@/app/inventory/warehouse/[warehouseId]/components/UserWarehouseMainTable";
import {prisma} from "db";

export default async function Page({ params }: {params: {id: string, warehouseId: string}}) {
    const warehouseId = params.warehouseId
    const warehouseDetails = await prisma.warehouses.findFirst({where: {id: parseInt(warehouseId)}})

    return (
        <main>
            <UserWarehouseMainTable ownerId={params.id} warehouseDetails={warehouseDetails}/>
        </main>
    )
}