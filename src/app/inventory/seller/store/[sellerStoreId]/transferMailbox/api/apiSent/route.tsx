import { prisma } from "@/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { store_id, depot_id, product_remaining_units, product_units, seller_profit_percentage, is_active, sell_price, sell_price_unit, seller_profit_quantity, price_discount_percentage, price_discount_quantity, seller_profit_unit } = await req.json()

    const data = {
        store_id,
        depot_id,
        product_remaining_units,
        product_units,
        seller_profit_percentage,
        is_active,
        sell_price,
        sell_price_unit,
        seller_profit_quantity,
        price_discount_percentage,
        price_discount_quantity,
        seller_profit_unit
    }

    const result = await prisma.store_depots.create({ data })

    return NextResponse.json(result)
}