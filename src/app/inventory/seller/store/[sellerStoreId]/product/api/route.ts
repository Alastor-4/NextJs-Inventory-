import { NextResponse } from 'next/server'
import { prisma } from "db";

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
                            store_depots: {
                                where: { store_id: storeId },
                                include: { product_offers: true }
                            }
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
        const storeDepot = await prisma.store_depots.findUnique({ where: { id: parseInt(storeDepotId) } })

        if (storeDepot?.sell_price?.toString() !== "0" || (storeDepot?.sell_price?.toString() === "0" && storeDepot?.is_active)) {
            const updatedDepot = await prisma.store_depots.update({ data: { is_active: !storeDepot?.is_active }, where: { id: storeDepot?.id } })

            return NextResponse.json(updatedDepot)
        }

        return new Response('La acción de modificar isActive ha fallado', { status: 400 })
    }

    return new Response('La acción de modificar isActive ha fallado', { status: 500 })
}

// Sell store depot one unit (default option)
export async function PATCH(req: Request) {
    const { storeDepotId } = await req.json()

    if (storeDepotId) {
        const storeDepot = await prisma.store_depots.findUnique({ where: { id: parseInt(storeDepotId) } })

        if (storeDepot?.is_active && !!storeDepot.product_remaining_units && storeDepot.sell_price) {
            const depotPrice = parseFloat(String(storeDepot.sell_price))

            const totalPrice = storeDepot.price_discount_percentage
                ? depotPrice - (storeDepot.price_discount_percentage * depotPrice / 100)
                : storeDepot.price_discount_quantity
                    ? depotPrice - storeDepot.price_discount_quantity
                    : depotPrice

            const [updatedStoreDepot] = await prisma.$transaction([
                prisma.store_depots.update({ data: { product_remaining_units: { decrement: 1 } }, where: { id: storeDepot.id } }),

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

    return new Response('La acción de vender ha fallado', { status: 400 })
}

// Sell store depots any unit quantity (manual option)
export async function POST(req: Request) {
    const { sellData, sellProductsData } = await req.json()

    let productSellItem

    try {
        productSellItem = await prisma.$transaction(async (tx) => {
            const sellItem = await tx.sells.create({
                data: {
                    payment_method: sellData.paymentMethod,
                    total_price: sellData.totalPrice,
                }
            })

            for (const sellProductsDatum of sellProductsData) {
                const updatedDepot = await tx.store_depots.update({
                    where: { id: parseInt(sellProductsDatum.storeDepotId) },
                    data: {
                        product_remaining_units: { decrement: parseInt(sellProductsDatum.unitsQuantity) },
                    },
                })

                if (updatedDepot.product_remaining_units !== null && updatedDepot.product_remaining_units < 0) {
                    throw new Error("La venta ha fallado porque no existe la cantidad solicitada por el usuario para alguno de los productos en cuestión")
                }

                await tx.sell_products.create(
                    {
                        data: {
                            units_quantity: parseInt(sellProductsDatum.unitsQuantity),
                            price: parseFloat(sellProductsDatum.price),
                            sell_id: sellItem.id,
                            store_depot_id: updatedDepot.id
                        }
                    }
                )
            }

            return sellItem
        })
    } catch (e) {
        return new Response(String(e), { status: 400 })
    }

    return NextResponse.json(productSellItem)
}
