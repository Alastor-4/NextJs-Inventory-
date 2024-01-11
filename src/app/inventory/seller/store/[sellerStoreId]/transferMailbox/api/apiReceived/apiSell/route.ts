import { prisma } from "@/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const {
        total_price,
        payment_method,
        store_depot_id,
        units_quantity,
        price
    } = await req.json()

    const dataSell = {
        total_price,
        payment_method,
    }

    const result = await prisma.sells.create({ data: dataSell })

    const dataProductSell = {
        sell_id: result.id,
        store_depot_id,
        units_quantity,
        price
    }

    const resultProductSell = await prisma.sell_products.create({ data: dataProductSell })

    return NextResponse.json(result)
}