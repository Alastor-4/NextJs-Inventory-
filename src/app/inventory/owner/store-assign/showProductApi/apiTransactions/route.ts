import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function POST(req: Request) {
    const { store_depot_id, units_transferred_quantity, transfer_direction, created_by_id } = await req.json()

    const data = {
        store_depot_id,
        units_transferred_quantity,
        transfer_direction,
        created_by_id
    }

    const result = await prisma.store_depot_transfers.create({ data })

    return NextResponse.json(result)
}