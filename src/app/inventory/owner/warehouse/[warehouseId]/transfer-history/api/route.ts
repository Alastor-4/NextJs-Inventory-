import {AxiomRequest, withAxiom} from "next-axiom";
import {prisma} from "db";
import {NextResponse} from "next/server";

interface transferHistoryProps {
    warehouseId: string,
}

// GET all transfers from a warehouse
export const GET = withAxiom(async (req: AxiomRequest, { params }: { params: transferHistoryProps }) => {
    const { searchParams } = new URL(req.url)

    const warehouseId = +params.warehouseId
    let whereCondition: any = {store_depots: {depots: {warehouse_id: warehouseId}}}

    const storeId = searchParams.get("storeId")
    if (storeId) {
        whereCondition.store_depots.store_id = +storeId
    }

    const dateStart = searchParams.get("dateStart")
    const dateEnd = searchParams.get("dateEnd")
    if (dateStart && dateEnd) {
        whereCondition.created_at = {
            gte: new Date(dateStart),
            lt: new Date(dateEnd),
        }
    }

    const transfers = await prisma.store_depot_transfers.findMany(
        {
            orderBy: {created_at: "desc"},
            where: whereCondition,
            include: {
                store_depots: {
                    include: {
                        depots: {include: {products: {include: {departments: true, images: true, characteristics: true}}}},
                        stores: true,
                    }
                },
                created_by_user: true
            }
        }
    )

    return NextResponse.json(transfers)
});