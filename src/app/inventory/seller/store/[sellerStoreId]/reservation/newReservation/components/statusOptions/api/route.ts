import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function PUT(req: Request) {
    const { id, status_id } = await req.json()

    const data = {
        status_id
    }
    const result = await prisma.reservations.update({
        where: { id: id },
        data
    })

    return NextResponse.json(result)

}

export async function POST(req: Request) {
    const { total_price, payment_method, from_reservation_id, requesting_user_id } = await req.json()

    const data = {
        total_price,
        payment_method,
        from_reservation_id,
        requesting_user_id

    }
    const result = await prisma.sells.create({ data })

    return NextResponse.json(result)

}