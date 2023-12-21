import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function PUT(req: Request) {
    const { id, unitsRemaining } = await req.json()

    const data = {
        product_remaining_units: unitsRemaining
    }

    const result = await prisma.store_depots.update({
        where: { id: id },
        data
    })

    return NextResponse.json(result)
}