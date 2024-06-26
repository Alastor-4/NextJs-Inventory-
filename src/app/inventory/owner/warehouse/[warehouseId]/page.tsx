import UserWarehouseMainTable from "./components/UserWarehouseMainTable";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { prisma } from "db";

export const dynamic = "force-dynamic";

const Page = async ({ params }: { params: { warehouseId: string } }) => {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;

    const warehouseId = +params.warehouseId;

    const warehouseDetails = await prisma.warehouses.findUnique({ where: { id: warehouseId } });

    return (
        <main>
            <UserWarehouseMainTable ownerId={userId} warehouseDetails={warehouseDetails} />
        </main>
    )
}

export default Page