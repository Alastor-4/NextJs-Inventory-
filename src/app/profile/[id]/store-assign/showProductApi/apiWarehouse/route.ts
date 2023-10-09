import { NextResponse } from "next/server"
import { prisma } from "db"
interface Params {
    params: { id: string }
}

export async function GET(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url)

    const storeId = parseInt(searchParams.get("storeId"))
    const warehouseId = parseInt(searchParams.get("warehouseId"))

    const result = await prisma.departments.findMany({
        where: {
            products: {
                some: {
                    depots: {
                        some: {
                            AND: [{

                                warehouse_id: warehouseId
                            },
                            {
                                OR: [{
                                    NOT: {
                                        store_depots: {
                                            some: {
                                                store_id: storeId
                                            }
                                        }
                                    }

                                }, {
                                    NOT: {
                                        store_depots: {
                                            some: {}
                                        }
                                    }

                                }
                                ]
                            }
                            ]
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
                            AND: [{

                                warehouse_id: warehouseId
                            },
                            {
                                OR: [{
                                    store_depots: {
                                        some: {
                                            store_id: { not: storeId }
                                        }
                                    }
                                }, {
                                    NOT: {
                                        store_depots: {
                                            some: {}
                                        }
                                    }

                                }
                                ]
                            }
                            ]

                        }
                    }

                },
                include: {
                    departments: true,
                    depots: true,
                    characteristics: true,
                    images: true
                }
            }
        }

    })
    return NextResponse.json(result);

}

export async function POST(req: Request) {
    const { storeId, depotId, product_units, product_remaining_units, seller_profit_percentage, is_active, offer_notes, price_discount_percentage, price_discount_quantity, sell_price, sell_price_unit, seller_profit_quantity  } = await req.json();

    const result = await prisma.store_depots.create({
        data: {
            store_id: storeId,
            depot_id: depotId,
            product_units,
            product_remaining_units,
            seller_profit_percentage,
            seller_profit_quantity,
            is_active,
            offer_notes,
            price_discount_percentage,
            price_discount_quantity,
            sell_price,
            sell_price_unit
        }
    })
    return NextResponse.json(result);
}

export async function PUT(req: Request) {
    const { id, product_id, warehouse_id, inserted_by_id, product_total_units, product_total_remaining_units } = await req.json();
    const data = {
        product_id,
        warehouse_id,
        inserted_by_id,
        product_total_units,
        product_total_remaining_units
    }

    const result = await prisma.depots.update({ data, where: { id: id } })

    return NextResponse.json(result);
}