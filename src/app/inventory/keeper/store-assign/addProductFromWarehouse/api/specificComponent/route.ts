import { NextResponse } from "next/server";
import { prisma } from "@/db";

// obtener un warehouse especifico
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = await +searchParams.get("storeId")!;
    const warehouseId = await +searchParams.get("warehouseId")!;

    const result = await prisma.warehouses.findMany({
        where: { id: warehouseId },
        include: {
            depots: {
                where: {
                    OR: [{
                        store_depots: {
                            some: {
                                OR: [{
                                    AND: [{ store_id: storeId }, { product_remaining_units: -1 }]
                                }, { store_id: { not: storeId } }]
                            }
                        }
                    }, { store_depots: { none: {} } }
                    ]
                },
                include: {
                    store_depots: { where: { store_id: storeId, product_remaining_units: -1, } },
                    products: { include: { departments: true, characteristics: true, images: true }, where: { is_approved: true } }
                }
            }
        }
    })


    return NextResponse.json(result);
}

//Modidica un storeDepots especifico
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