import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoreDepotsAssign from "@/components/StoreDepotsAssign";
import { storeWithStoreDepots } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import { warehouses } from "@prisma/client";
import { prisma } from "db";

export default async function Page({ searchParams }: { searchParams: { storeId: string, warehouseId: string } }) {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;

    const { storeId, warehouseId } = searchParams;

    const ownerWarehouses: warehouses[] = await prisma.warehouses.findMany({ where: { owner_id: userId } });
    const ownerStores: storeWithStoreDepots[] = await prisma.stores.findMany({ where: { owner_id: userId }, include: { store_depots: true } });

    return (
        <main>
            <StoreDepotsAssign
                selectedWarehouseId={+warehouseId!}
                selectedStoreId={+storeId}
                warehouseList={ownerWarehouses}
                storeList={ownerStores}
                userId={userId}
            />
        </main>
    )
}