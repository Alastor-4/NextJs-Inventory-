import { NextResponse } from 'next/server';
import { prisma } from "db";

// Get all stores and a specific depot info
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const depotId = +searchParams.get("depotId")!;
    const ownerId = +searchParams.get("userId")!;

    if (ownerId && depotId) {
        const storeDepots = await prisma.stores.findMany(
            {
                where: {
                    owner_id: ownerId
                },
                include: {
                    store_depots: { where: { depot_id: depotId } }
                }
            }
        )

        return NextResponse.json(storeDepots)
    }

    return new Response('La acción de obtener los depósitos ha fallado', { status: 500 })
}

// Send depot units from warehouse to store
export async function PUT(req: Request) {
    const { ownerId, depotId, storeDepotId, storeId, moveUnitQuantity } = await req.json()

    try {
        let updatedDepot
        let updatedStoreDepot

        if (ownerId && depotId) {
            const depot = await prisma.depots.findUnique({ where: { id: depotId } })

            if (depot?.product_total_remaining_units && (moveUnitQuantity <= depot.product_total_remaining_units)) {
                updatedDepot = await prisma.depots.update(
                    {
                        data: { product_total_remaining_units: { decrement: moveUnitQuantity } },
                        where: { id: depotId },
                        include: {products: true}
                    }
                )

                if (storeDepotId) {
                    let addUnits = moveUnitQuantity
                    const currentDepot = await prisma.store_depots.findUnique({where: {id: storeDepotId}})
                    if (currentDepot!.product_remaining_units === -1)
                     addUnits++

                    updatedStoreDepot = await prisma.store_depots.update(
                        {
                            data:
                            {
                                product_units: { increment: moveUnitQuantity },
                                product_remaining_units: { increment: addUnits },
                                store_depot_transfers: {
                                    create: {
                                        transfer_direction: "2",
                                        units_transferred_quantity: +moveUnitQuantity,
                                        created_by_id: +ownerId,
                                    }
                                }
                            },
                            where: { id: storeDepotId }
                        }
                    )
                } else {
                    const parentStore = await prisma.stores.findUnique({ where: { id: storeId } })

                    let data = {
                        store_id: storeId,
                        depot_id: depotId,
                        product_units: moveUnitQuantity,
                        product_remaining_units: moveUnitQuantity,
                        sell_price: updatedDepot!.products!.fixed_sell_price,
                        sell_price_unit: updatedDepot!.products!.fixed_sell_price_unit,
                        store_depot_transfers: {
                            create: {
                                transfer_direction: "2",
                                units_transferred_quantity: +moveUnitQuantity,
                                created_by_id: +ownerId,
                            }
                        }
                    }

                    if (parentStore?.fixed_seller_profit_percentage) {
                        // @ts-ignore
                        data.seller_profit_percentage = parentStore.fixed_seller_profit_percentage
                    }
                    if (parentStore?.fixed_seller_profit_quantity) {
                        // @ts-ignore
                        data.seller_profit_quantity = parentStore.fixed_seller_profit_quantity
                    }

                    updatedStoreDepot = await prisma.store_depots.create({ data: data })
                }

                return NextResponse.json({ updatedDepot, updatedStoreDepot })
            } else {
                return new Response('La acción de agregar productos ha fallado', { status: 412 })
            }
        }

        return new Response('La acción de agregar productos ha fallado', { status: 412 })
    } catch (e) {
        return new Response('La acción de agregar productos ha fallado', { status: 500 })
    }
}

// Send depot units from store to warehouse
export async function PATCH(req: Request) {
    const { ownerId, depotId, storeDepotId, moveUnitQuantity } = await req.json()

    try {
        if (ownerId && depotId && storeDepotId) {
            const storeDepot = await prisma.store_depots.findUnique({ where: { id: storeDepotId } })

            if (storeDepot?.product_remaining_units && (moveUnitQuantity <= storeDepot.product_remaining_units)) {
                const updatedStoreDepot = await prisma.store_depots.update(
                    {
                        data: {
                            product_remaining_units: { decrement: moveUnitQuantity },
                            store_depot_transfers: {
                                create: {
                                    transfer_direction: "1",
                                    units_transferred_quantity: +moveUnitQuantity,
                                    created_by_id: +ownerId,
                                }
                            }
                        },
                        where: { id: storeDepotId }
                    }
                )

                const updatedDepot = await prisma.depots.update(
                    {
                        data: { product_total_remaining_units: { increment: moveUnitQuantity } },
                        where: { id: depotId }
                    }
                )

                return NextResponse.json({ updatedDepot, updatedStoreDepot })
            } else {
                return new Response('La acción de agregar productos ha fallado', { status: 412 })
            }
        }

        return new Response('La acción de agregar productos ha fallado', { status: 412 })
    } catch (e) {
        return new Response('La acción de agregar productos ha fallado', { status: 500 })
    }
}