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
export async function PUT(req: Request) {
    const { storeDepotId } = await req.json()

    if (storeDepotId) {
        const storeDepot = await prisma.store_depots.findUnique({where: {id: parseInt(storeDepotId)}})

        if (storeDepot?.sell_price?.toString() !== "0" || (storeDepot?.sell_price?.toString() === "0" && storeDepot?.is_active)) {
            const updatedDepot = await prisma.store_depots.update({data: {is_active: !storeDepot?.is_active}, where: {id: storeDepot?.id}})

            return NextResponse.json(updatedDepot)
        }

        return new Response('La acción de modificar isActive ha fallado', {status: 400})
    }

    return new Response('La acción de modificar isActive ha fallado', {status: 500})
}

// Sell store depot one unit (default option)
export async function PATCH(req: Request) {
    const { storeDepotId } = await req.json()

    if (storeDepotId) {
        const storeDepot = await prisma.store_depots.findUnique({where: {id: parseInt(storeDepotId)}})

        if (storeDepot?.is_active && !!storeDepot.product_remaining_units && storeDepot.sell_price) {
            const depotPrice = parseFloat(String(storeDepot.sell_price))

            const totalPrice = storeDepot.price_discount_percentage
                ? depotPrice - (storeDepot.price_discount_percentage * depotPrice / 100)
                : storeDepot.price_discount_quantity
                    ? depotPrice - storeDepot.price_discount_quantity
                    : depotPrice

            const [updatedStoreDepot] = await prisma.$transaction([
                prisma.store_depots.update({data: {product_remaining_units: {decrement: 1}}, where: {id: storeDepot.id}}),

                prisma.sells.create(
                    {
                        data: {
                            total_price: totalPrice,
                            payment_method: "Efectivo CUP",
                            sell_products: {
                                create: {
                                    store_depot_id: storeDepot.id,
                                    units_quantity: 1,
                                    price: totalPrice
                                }
                            }
                        }
                    }
                )
            ])

            return NextResponse.json(updatedStoreDepot)
        }
    }

    return new Response('La acción de vender ha fallado', {status: 400})
}

// Sell store depot any unit quantity (manual option)
export async function POST(req: Request) {
    const { storeDepotId, unitsQuantity, unitBuyPrice, totalPrice, paymentMethod } = await req.json()

    const parseUnitsQuantity = parseInt(unitsQuantity)
    const parseUnitBuyPrice = parseFloat(unitBuyPrice)
    const parseTotalPrice = parseFloat(totalPrice)

    if (storeDepotId) {
        const storeDepot = await prisma.store_depots.findUnique({where: {id: parseInt(storeDepotId)}})

        if (storeDepot?.is_active && storeDepot.product_remaining_units && storeDepot.product_remaining_units > parseUnitsQuantity) {
            const [updatedStoreDepot] = await prisma.$transaction([
                prisma.store_depots.update({data: {product_remaining_units: {decrement: parseUnitsQuantity}}, where: {id: storeDepot.id}}),

                prisma.products_sell.create(
                    {
                        data: {
                            store_depot_id: storeDepot.id,
                            units_quantity: parseUnitsQuantity,
                            // @ts-ignore
                            unit_buy_price: parseUnitBuyPrice,
                            // @ts-ignore
                            total_price: parseTotalPrice,
                            payment_method: paymentMethod,
                        }
                    }
                )
            ])

            return NextResponse.json(updatedStoreDepot)
        }
    }

    return new Response('La acción de vender ha fallado', {status: 400})
}
