import {NextResponse} from 'next/server'
import {prisma} from "db";

// Get all stores and a specific depot info
export async function GET(request: Request, {params}: { params: { id: string } }) {
    const {searchParams} = new URL(request.url)

    const ownerId = params.id

    const depotId = searchParams.get("depotId")

    if (ownerId && depotId) {
        const storeDepots = await prisma.stores.findMany(
            {
                where: {
                   owner_id: parseInt(ownerId)
                },
                include: {
                    store_depots: { where: {depot_id: parseInt(depotId)} }
                }
            }
        )

        return NextResponse.json(storeDepots)
    }

    return new Response('La acción de obtener los depósitos ha fallado', {status: 500})
}

// Send depot units from warehouse to store
export async function PUT(req, res) {
    const {ownerId, depotId, storeDepotId, storeId, moveUnitQuantity} = await req.json()

    try {
        let updatedDepot
        let updatedStoreDepot

        if (ownerId && depotId) {
            const depot = await prisma.depots.findUnique({where: {id: parseInt(depotId)}})

            if (parseInt(moveUnitQuantity) <= depot.product_total_remaining_units) {
                updatedDepot = await prisma.depots.update(
                    {
                        data: {product_total_remaining_units: {decrement: parseInt(moveUnitQuantity)}},
                        where: {id: parseInt(depotId)}
                    }
                )

                if (storeDepotId) {
                    updatedStoreDepot = await prisma.store_depots.update(
                        {
                            data:
                                {
                                    product_units: {increment: parseInt(moveUnitQuantity)},
                                    product_remaining_units: {increment: parseInt(moveUnitQuantity)}
                                },
                            where: {id: parseInt(storeDepotId)}
                        }
                    )
                } else {
                    const parentStore = await prisma.stores.findUnique({where: {id: parseInt(storeId)}})

                    const data = {
                        store_id: parseInt(storeId),
                        depot_id: parseInt(depotId),
                        product_units: moveUnitQuantity,
                        product_remaining_units: moveUnitQuantity,
                    }

                    if (parentStore.seller_profit_percentage)
                        data.seller_profit_percentage = parentStore.fixed_seller_profit_percentage

                    if (parentStore.seller_profit_quantity)
                        data.seller_profit_quantity = parentStore.fixed_seller_profit_quantity

                    updatedStoreDepot = await prisma.store_depots.create({data: data})
                }

                return NextResponse.json({updatedDepot, updatedStoreDepot})
            } else {
                return new Response('La acción de agregar productos ha fallado', {status: 412})
            }
        }

        return new Response('La acción de agregar productos ha fallado', {status: 500})
    } catch (e) {
        return new Response('La acción de agregar productos ha fallado', {status: 500})
    }
}