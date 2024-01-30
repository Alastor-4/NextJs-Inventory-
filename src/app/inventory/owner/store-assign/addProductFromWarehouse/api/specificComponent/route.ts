import { NextResponse } from "next/server";
import { prisma } from "@/db";
import {transactionToStore} from "@/utils/generalFunctions";

// obtener un warehouse especifico
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = await parseInt(<string>searchParams.get("storeId"));
    const warehouseId = await parseInt(<string>searchParams.get("warehouseId"));

    const result = await prisma.warehouses.findMany({
        where: {
            id: warehouseId
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
                            store_id: storeId,
                            product_remaining_units: -1,
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


//Modidica un storeDepots especifico
export async function PUT(req: Request) {
    const {
        id,
        store_id,
        depot_id,
        product_units,
        product_remaining_units,
        sell_price,
        sell_price_unit,
        price_discount_percentage,
        price_discount_quantity,
        seller_profit_percentage,
        seller_profit_quantity,
        is_active,
        userId,
    } = await req.json();

    const result = await prisma.store_depots.update({
        data: {
            store_id: store_id,
            depot_id: depot_id,
            product_units: product_units,
            product_remaining_units: product_remaining_units,
            sell_price: sell_price,
            sell_price_unit: sell_price_unit,
            price_discount_percentage: price_discount_percentage,
            price_discount_quantity: price_discount_quantity,
            seller_profit_percentage: seller_profit_percentage,
            seller_profit_quantity: seller_profit_quantity,
            is_active: is_active,
            store_depot_transfers: {
                create: {
                    transfer_direction: transactionToStore,
                    units_transferred_quantity: product_remaining_units,
                    created_by_id: userId,
                }
            }
        },
        where: { id: id }
    })
    return NextResponse.json(result)
}