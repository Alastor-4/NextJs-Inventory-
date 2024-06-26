import { prisma } from "db"; import { sell_payment_methods } from '@prisma/client';
import { NextResponse } from 'next/server';
;

//CREATE sell unreceived
export async function POST(req: Request) {
    const { sellData, sellProductsData, sellReceivableData } = await req.json();

    let productSellItem;
    let sellPaymentMethods: sell_payment_methods[] = [];

    try {
        for (const sellPaymentMethod of sellData.sellPaymentMethod) {
            const method = await prisma.sell_payment_methods.create({
                data: {
                    quantity: sellPaymentMethod.quantity,
                    payment_method: sellPaymentMethod.paymentMethod,
                },
            });
            sellPaymentMethods.push(method);
        }

        productSellItem = await prisma.$transaction(async (tx) => {
            const sellItem = await tx.sells_receivable.create({
                data: {
                    total_price: sellData.totalPrice,
                    pay_before_date: sellReceivableData.payBefore,
                    description: sellReceivableData.description
                },
            });

            for (const method of sellPaymentMethods) {
                await tx.sell_payment_methods.update({
                    where: { id: method.id }, data: { sells_receivable_id: sellItem.id }
                });
            }

            for (const sellProductsDatum of sellProductsData) {
                const updatedDepot = await tx.store_depots.update({
                    where: { id: +sellProductsDatum.storeDepotId },
                    data: { product_remaining_units: { decrement: +sellProductsDatum.unitsQuantity }, },
                })

                if (updatedDepot.product_remaining_units !== null && updatedDepot.product_remaining_units < 0) {
                    throw new Error("La venta ha fallado porque no existe la cantidad solicitada por el usuario para alguno de los productos en cuestión")
                }

                await tx.sell_receivable_products.create(
                    {
                        data: {
                            units_quantity: +sellProductsDatum.unitsQuantity,
                            price: +sellProductsDatum.price,
                            sell_receivable_id: sellItem.id,
                            store_depot_id: updatedDepot.id
                        }
                    }
                )
            }

            return sellItem
        })

    } catch (e) {
        return new Response(String(e), { status: 400 });
    }
    return NextResponse.json(productSellItem);
}
