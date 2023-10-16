import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get store products
export async function GET(request: Request, { params }: { params: { sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const storeProducts = await prisma.departments.findMany({
        where: {
            products: {
                some: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    store_id: storeId
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
                                    store_id: storeId
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
                },
            },
        },
    })

    return NextResponse.json(storeProducts)
}

// Toggle store depot isActive
export async function PUT(req, res) {
    const { storeDepotId } = await req.json()

    if (storeDepotId) {
        const storeDepot = await prisma.store_depots.findUnique({where: {id: parseInt(storeDepotId)}})

        if (storeDepot?.sell_price?.toString() !== "0" || (storeDepot?.sell_price?.toString() === "0" && storeDepot?.is_active)) {
            const updatedDepot = await prisma.store_depots.update({data: {is_active: !storeDepot.is_active}, where: {id: storeDepot.id}})

            return NextResponse.json(updatedDepot)
        }

        return new Response('La acción de modificar isActive ha fallado', {status: 400})
    }

    return new Response('La acción de modificar isActive ha fallado', {status: 500})
}

// Sell store depot one unit (default option)
export async function PATCH(req, res) {
    const { storeDepotId } = await req.json()

    if (storeDepotId) {
        const storeDepot = await prisma.store_depots.findUnique({where: {id: parseInt(storeDepotId)}})

        if (storeDepot?.is_active && !!storeDepot.product_remaining_units) {
            const [updatedStoreDepot] = await prisma.$transaction([
                prisma.store_depots.update({data: {product_remaining_units: {decrement: 1}}, where: {id: storeDepot.id}}),

                prisma.products_sell.create(
                    {
                        data: {
                            store_depot_id: storeDepot.id,
                            units_quantity: 1,
                            unit_buy_price: storeDepot.sell_price,
                            total_price: storeDepot.sell_price,
                            payment_method: "Efectivo CUP",
                        }
                    }
                )
            ])

            return NextResponse.json(updatedStoreDepot)
        }
    }

    return new Response('La acción de vender ha fallado', {status: 400})
}
