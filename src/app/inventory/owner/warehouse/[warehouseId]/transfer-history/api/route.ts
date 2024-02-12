import {AxiomRequest, withAxiom} from "next-axiom";
import {prisma} from "db";
import {NextResponse} from "next/server";

// GET all transfers from a warehouse
export const GET = withAxiom(async (req: AxiomRequest, { params }: { params: { warehouseId: string } }) => {

    const warehouseId = +params.warehouseId

    const transfers = await prisma.store_depot_transfers.findMany(
        {
            orderBy: {created_at: "desc"},
            where: { store_depots: {depots: {warehouse_id: warehouseId}} },
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