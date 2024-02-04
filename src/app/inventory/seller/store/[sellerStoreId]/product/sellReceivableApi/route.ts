import { NextResponse } from 'next/server'
import { prisma } from "db";

// create sell unreceived
export async function POST(req: Request) {
    const { sellData, sellProductsData } = await req.json()

    let productSellItem

    try {
        productSellItem = await prisma.$transaction(async (tx) => {
            const sellItem = await tx.sells_receivable.create({
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

                await tx.sell_receivable_products.create(
                    {
                        data: {
                            units_quantity: parseInt(sellProductsDatum.unitsQuantity),
                            price: parseFloat(sellProductsDatum.price),
                            sell_receivable_id: sellItem.id,
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
