import StoreDepotsAssign from "@/components/StoreDepotsAssign";
import { prisma } from "db";

export default async function Page({ params }: {params: {id: string}}) {
     const ownerId = params.id
     const ownerWarehouses = await prisma.warehouses.findMany({ where: { owner_id: parseInt(ownerId) } })
     const ownerStores = await prisma.stores.findMany({ where: { owner_id: parseInt(ownerId) } })

    return (
        <main>
            <StoreDepotsAssign
                warehouseListProp={ownerWarehouses}
                selectedWarehouseIdProp={ownerWarehouses[0].id}
                storeListProp={ownerStores}
            />
        </main>
    )
}