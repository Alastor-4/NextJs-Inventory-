import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoreDepotsAssign from "@/components/StoreDepotsAssign";
import { getServerSession } from "next-auth";
import { prisma } from "db";

export default async function Page({ searchParams }: { searchParams: { storeId: string, warehouseId: string } }) {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;

    const storeId = searchParams.storeId
    const warehouseId = searchParams.warehouseId

    const ownerWarehouses = await prisma.warehouses.findMany({ where: { owner_id: userId } });
    const ownerStores = await prisma.stores.findMany({ where: { owner_id: userId } });

    return (
        <main>
            <StoreDepotsAssign
                warehouseListProp={ownerWarehouses}
                selectedWarehouseIdProp={warehouseId ? parseInt(warehouseId) : ownerWarehouses[0]?.id ?? null}
                selectedStoreIdProp={storeId ? parseInt(storeId) : null}
                storeListProp={ownerStores}
                userId={userId}
            />
        </main>
    )
}