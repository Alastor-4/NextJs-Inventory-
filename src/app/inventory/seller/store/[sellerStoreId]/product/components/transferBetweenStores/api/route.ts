import { NextResponse } from "next/server";
import { prisma } from "@/db";

interface Params {
    params: {
        sellerStoreId: string
    }
}

export async function GET(req: Request, { params }: Params) {
    const storeId = parseInt(params.sellerStoreId)

    const result = await prisma.stores.findMany({
        where: {
            NOT: {
                id: storeId
            }
        }

    })

    return NextResponse.json(result)
}

export async function POST(req: Request) {
    const { store_depot_id, units_transferred_quantity, from_store_accepted, to_store_id, to_store_accepted, transfer_notes, transfer_cancelled } = await req.json()
    const data = {
        store_depot_id,
        units_transferred_quantity,
        from_store_accepted,
        to_store_id,
        to_store_accepted,
        transfer_notes,
        transfer_cancelled
    }

    const result = await prisma.product_store_transfers.create({ data })

    return NextResponse.json(result)

}

export async function PUT(req: Request) {
    const { id, product_remaining_units } = await req.json()
    const data = {
        id,
        product_remaining_units
    }

    const result = await prisma.store_depots.update({ data, where: { id: id } })

    return NextResponse.json(result)
}