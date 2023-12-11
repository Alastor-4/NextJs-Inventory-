import StoreDepotsAssign from "@/components/StoreDepotsAssign";
import { prisma } from "db";

export default async function Page({ params, searchParams }: { params: { id: string }, searchParams: { storeId: string, warehouseId: string } }) {

    const storeId = searchParams.storeId
    const warehouseId = searchParams.warehouseId
    const ownerId = params.id
    const ownerWarehouses = await prisma.warehouses.findMany({ where: { owner_id: parseInt(ownerId) } })
    const ownerStores = await prisma.stores.findMany({ where: { owner_id: parseInt(ownerId) } })

    return (
        <main>
            <StoreDepotsAssign
                warehouseListProp={ownerWarehouses}
                selectedWarehouseIdProp={warehouseId ? parseInt(warehouseId) : ownerWarehouses[0]?.id ?? null}
                selectedStoreIdProp={storeId ? parseInt(storeId) : null}
                storeListProp={ownerStores}
            />
        </main>
    )
}