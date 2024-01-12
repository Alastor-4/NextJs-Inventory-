import { NextResponse } from "next/server"
import { prisma } from "@/db"

interface Params {
    params: { sellerStoreId: string }
}

export async function GET(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url)

    const productId = parseInt(<string>searchParams.get('productId'))
    const storeId = parseInt(params.sellerStoreId)

    const result = await prisma.store_depots.findFirst({
        where: {
            AND: [
                {
                    depots: {
                        products: {
                            id: productId
                        }
                    }
                },
                {
                    store_id: storeId
                }

            ]
        },
        include: {
            product_offers: true
        }
    })

    return NextResponse.json(result)
}


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

export async function PUT(req: Request) {
    const { id, product_remaining_units, product_units } = await req.json()

    const data = {
        product_remaining_units,
        product_units
    }

    const result = await prisma.store_depots.update({ data, where: { id: id } })

    return NextResponse.json(result)
}