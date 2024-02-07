import { NextResponse } from "next/server"
import { prisma } from "db"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = parseInt(<string>searchParams.get("storeId"))
    const ownerId = parseInt(<string>searchParams.get("ownerId"))

    const result = await prisma.warehouses.findMany({
        where: {
            owner_id: ownerId,
            depots: {
                some: {
                    OR: [
                        {
                            store_depots: {
                                some: {
                                    OR: [
                                        {
                                            AND: [
                                                {store_id: storeId},
                                                {product_remaining_units: -1}
                                            ]
                                        },
                                        {store_id: {not: storeId}}
                                    ]
                                }
                            }
                        },
                        {
                            store_depots: {
                                none: {}
                            }
                        }
                    ]
                }

            }
        },
        include: {
            depots: {
                where: {
                    OR: [
                        {
                            store_depots: {
                                some: {
                                    OR: [
                                        {
                                            AND: [
                                                {store_id: storeId},
                                                {product_remaining_units: -1}
                                            ]
                                        },
                                        {store_id: {not: storeId}}
                                    ]
                                }
                            }
                        },
                        {
                            store_depots: {
                                none: {}
                            }
                        }
                    ]
                },
                include: {
                    store_depots: {
                        where: {
                            AND: [
                                {store_id: storeId},
                                {product_remaining_units: -1},
                            ]
                        }
                    },
                    products: {
                        include: {
                            departments: true,
                            characteristics: true,
                            images: true
                        }
                    }
                }
            }

        }
    })


    return NextResponse.json(result)
}

export async function POST(req: Request) {
    const { store_id, depot_id, product_units, product_remaining_units, seller_profit_percentage, seller_profit_quantity, userId } = await req.json();

    const depotItem = await prisma.depots.findUnique({
        where: {id: depot_id},
        include: {products: true}
    })

    const result = await prisma.store_depots.create({
        data: {
            store_id: store_id,
            depot_id: depot_id,
            product_units: product_units,
            product_remaining_units: product_remaining_units,
            seller_profit_percentage: seller_profit_percentage,
            seller_profit_quantity: seller_profit_quantity,
            sell_price: depotItem!.products!.fixed_sell_price,
            sell_price_unit: depotItem!.products!.fixed_sell_price_unit,
            store_depot_transfers: {
                create: {
                    transfer_direction: "2",
                    units_transferred_quantity: product_remaining_units,
                    created_by_id: userId,
                }
            }
        }
    })

    return NextResponse.json(result);
}

export async function PUT(req: Request) {
    const { id, product_id, warehouse_id, product_total_units, product_total_remaining_units } = await req.json();

    const result = await prisma.depots.update({
        data: {
            product_id: product_id,
            warehouse_id: warehouse_id,
            product_total_units: product_total_units,
            product_total_remaining_units: product_total_remaining_units
        },
        where: { id: id } }
    )

    return NextResponse.json(result);
}