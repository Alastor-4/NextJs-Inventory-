import StoreDepotsAssign from "@/components/StoreDepotsAssign";
import { prisma } from "db";
//import ShowProducts from '@/app/profile/[id]/store-assign/components/ShowProducts'

export default async function Page({ params }) {
    const ownerId = params.id
    const ownerWarehouses = await prisma.warehouses.findMany({ where: { owner_id: parseInt(ownerId) } })
    const ownerStores = await prisma.stores.findMany({ where: { owner_id: parseInt(ownerId) } })

    return (
        <main>
            <StoreDepotsAssign ownerId={ownerId} warehouseListProp={ownerWarehouses} selectedWarehouseIdProp={ownerWarehouses[0].id}
                storeListProp={ownerStores} selectedStoreIdProp={null} />

            {/* <ShowProducts storeId={'2'} warehouseId={'1'} /> */}
        </main>
    )
}