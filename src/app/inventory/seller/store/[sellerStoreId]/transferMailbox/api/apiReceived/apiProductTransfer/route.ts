import { NextResponse } from "next/server";
import { prisma } from "@/db";
import {create} from "zustand";

interface Params {
    params: { sellerStoreId: string }
}

export async function GET(req: Request, { params }: Params) {
    const storeId = parseInt(params.sellerStoreId)

    const result = await prisma.product_store_transfers.findMany({
        where: {
            to_store_id: storeId
        },
        include: {
            store_depots: {
                include: {
                    depots: {
                        include: {
                            products: {
                                include: {
                                    characteristics: true,
                                    images: true,
                                    departments: true
                                }
                            }
                        }
                    },
                    stores: true,
                    product_offers: true,
                }
            }
        }
    })

    return NextResponse.json(result)
}

//handle accept transfer
export async function POST(req: Request) {
    const { id } = await req.json()

    const storeTransferItem = await prisma.product_store_transfers.findUniqueOrThrow(
        {
            where: { id: parseInt(id) },
            include: {
                store_depots: {
                    include: {
                        depots: {include: {products: true}},
                        product_offers: true,
                        store_depot_properties: true
                    }
                }
            }
        }
    )

    if (!storeTransferItem.to_store_accepted && !storeTransferItem.transfer_cancelled) {
        const depotId = storeTransferItem.store_depots!.depots!.id
        const productId = storeTransferItem.store_depots!.depots!.products!.id

        //search if exists a depot for same product in destination store
        const depotInDestinationStore = await prisma.store_depots.findFirst(
            {
                where: {
                    store_id: storeTransferItem.to_store_id,
                    depots: {products: {id: productId}}
                }
            }
        )

        let res1
        let res2

        if (depotInDestinationStore) {
            //when depot exist only modify with transferred units in it
            [res1, res2] = await prisma.$transaction([
                prisma.store_depots.update(
                    {
                        data: {
                            product_remaining_units: {// @ts-ignore
                                increment: depotInDestinationStore.product_remaining_units === -1
                                    ? storeTransferItem.units_transferred_quantity! + 1
                                    : storeTransferItem.units_transferred_quantity
                            },
                            product_units: {increment: storeTransferItem.units_transferred_quantity!}
                        }
                    }
                ),

                prisma.product_store_transfers.update({ data: { from_store_accepted: true }, where: { id: storeTransferItem.id } })
            ])
        } else {
            //when depot does not exist create it with same properties in origen store
            [res1, res2] = await prisma.$transaction([
                prisma.store_depots.create(
                    {
                        data: {
                            store_id: storeTransferItem.to_store_id,
                            depot_id: depotId,
                            product_units: storeTransferItem.units_transferred_quantity,
                            product_remaining_units: storeTransferItem.units_transferred_quantity,
                            sell_price: storeTransferItem.store_depots!.sell_price,
                            sell_price_unit: storeTransferItem.store_depots!.sell_price_unit,
                            seller_profit_quantity: storeTransferItem.store_depots!.seller_profit_quantity,
                            seller_profit_percentage: storeTransferItem.store_depots!.seller_profit_percentage,
                            seller_profit_unit: storeTransferItem.store_depots!.seller_profit_unit,
                            price_discount_percentage: storeTransferItem.store_depots!.price_discount_percentage,
                            price_discount_quantity: storeTransferItem.store_depots!.price_discount_quantity,
                            discount_description: storeTransferItem.store_depots!.discount_description,
                            product_offers: {createMany: {data: storeTransferItem.store_depots!.product_offers}},
                            store_depot_properties: {createMany: {data: storeTransferItem.store_depots!.store_depot_properties}}
                        }
                    }
                ),

                prisma.product_store_transfers.update({ data: { from_store_accepted: true }, where: { id: storeTransferItem.id } })
            ])
        }

        return NextResponse.json(res2)
    } else {
        return new Response("Ya se ha tomado alguna acción sobre la transferencia proporcionada", {status: 400})
    }
}

export async function PUT(req: Request) {
    const { id, from_store_accepted, to_store_accepted, transfer_cancelled } = await req.json()

    const data = {
        from_store_accepted,
        to_store_accepted,
        transfer_cancelled
    }

    const result = await prisma.product_store_transfers.update({ data, where: { id: id } })

    return NextResponse.json(result)
}