import { NextResponse } from "next/server";
import { prisma } from 'db'

export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);
    const storeId = parseInt(<string>searchParams.get("storeId"));

    const result = await prisma.departments.findMany({
        where: {
            products: {
                some: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    AND: [
                                        {
                                            store_id: storeId
                                        },
                                        {
                                            product_units: { not: -1 }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },
        include: {
            products: {
                where: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    AND: [
                                        {
                                            store_id: storeId
                                        },
                                        {
                                            product_units: { not: -1 }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                include: {
                    departments: true,
                    depots: {
                        include: {
                            store_depots: true
                        }
                    },
                    characteristics: true,
                    images: true,

                }
            }
        }
    })
    return NextResponse.json(result)
}
export async function PUT(req: Request) {
    const { id, store_id, depot_id, product_units, product_remaining_units, sell_price, sell_price_units, price_discount_percentage, price_discount_quantity, seller_profit_percentage, seller_profit_quantity, is_active } = await req.json();
    const data = {
        store_id,
        depot_id,
        product_units,
        product_remaining_units,
        sell_price,
        sell_price_units,
        price_discount_percentage,
        price_discount_quantity,
        seller_profit_percentage,
        seller_profit_quantity,
        is_active,
    }
    const result = await prisma.store_depots.update({ data, where: { id: id } })
    return NextResponse.json(result)
}

export async function DELETE(req: Requesr) {
    const { searchParams } = new URL(req.url)
    const storeDepotId = parseInt(<string>searchParams.get("storeDepotId"))

    const result = await prisma.store_depots.delete({ where: { id: storeDepotId } })

    return NextResponse.json(result);
}