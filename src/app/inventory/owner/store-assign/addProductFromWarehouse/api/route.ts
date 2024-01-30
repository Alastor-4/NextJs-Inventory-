import { NextResponse } from "next/server"
import { prisma } from "db"
import {transactionToStore} from "@/utils/generalFunctions";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = parseInt(<string>searchParams.get("storeId"))

    const result = await prisma.warehouses.findMany({
        where: {
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

    const result = await prisma.store_depots.create({
        data: {
            store_id: store_id,
            depot_id: depot_id,
            product_units: product_units,
            product_remaining_units: product_remaining_units,
            seller_profit_percentage: seller_profit_percentage,
            seller_profit_quantity: seller_profit_quantity,
            store_depot_transfers: {
                create: {
                    transfer_direction: transactionToStore,
                    units_transferred_quantity: product_remaining_units,
                    created_by_id: userId,
                }
            }
        }
    })

    return NextResponse.json(result);
}

export async function PUT(req: Request) {
    const { id, product_id, warehouse_id, inserted_by_id, product_total_units, product_total_remaining_units } = await req.json();

    const data = {
        product_id: product_id,
        warehouse_id: warehouse_id,
        inserted_by_id: inserted_by_id,
        product_total_units: product_total_units,
        product_total_remaining_units: product_total_remaining_units
    }

    const result = await prisma.depots.update({ data, where: { id: id } })

    return NextResponse.json(result);
}