import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const productId = parseInt(<string>searchParams.get("productId"))

    const result = await prisma.warehouses.findMany({
        where: {
            depots: {
                some: {
                    product_id: productId
                }
            }
        },
        include: {
            depots: {
                where: {
                    product_id: productId
                }
            }
        }
    })
    return NextResponse.json(result);
}

export async function POST(req: Request) {
    const { store_depot_id, units_transferred_quantity, transfer_direction } = await req.json()

    const data = {
        store_depot_id,
        units_transferred_quantity,
        transfer_direction
    }

    const result = await prisma.store_depot_transfers.create({ data })

    return NextResponse.json(result)
}

export async function PUT(req: Request) {
    const { depotId, product_total_remaining_units, storeDepotId, product_remaining_units, product_units } = await req.json()

    const dataDepot = {
        product_total_remaining_units: product_total_remaining_units,
    }
    const dataStoreDepot = {
        product_remaining_units: product_remaining_units,
        product_units: product_units
    }

    const responseDepot = await prisma.depots.update({ data: dataDepot, where: { id: depotId } });
    const responseStoreDepot = await prisma.store_depots.update({ data: dataStoreDepot, where: { id: storeDepotId } });

    return NextResponse.json(responseDepot)

}
