import WarehouseTransferHistory
    from "@/app/inventory/owner/warehouse/[warehouseId]/transfer-history/components/WarehouseTransferHistory";
import {prisma} from "db";
import {getServerSession} from "next-auth";
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

const Page = async ({ params }: { params: { warehouseId: string } }) => {
    const session = await getServerSession(nextAuthOptions)

    const userId = session?.user.id;
    const ownerStores = await prisma.stores.findMany({where: {owner_id: +userId!}})

    const warehouseId = +params.warehouseId;

    return (
        <main>
            <WarehouseTransferHistory warehouseId={warehouseId} ownerStores={ownerStores}/>
        </main>
    )
}

export default Page