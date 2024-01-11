import { NextResponse } from "next/server"
import { prisma } from "@/db"

export async function POST(req: Request) {
    const { product_offers } = await req.json()

    const data = product_offers

    const result = await prisma.product_offers.createMany({ data })

    return NextResponse.json(result)
}