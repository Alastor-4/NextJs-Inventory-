import { NextResponse } from 'next/server';
import { prisma } from "db";
import { sell_payment_methods } from '@prisma/client';

// GET receivable sells
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const storeId = +searchParams.get("storeId")!;
        const allSells = searchParams.get("loadAllSells");
        const todayStart = searchParams.get("todayStart");
        const todayEnd = searchParams.get("todayEnd");

        if (storeId && (allSells === 'true')) {
            const storeAllSellsReceivable = await prisma.sells_receivable.findMany({
                where: {
                    sell_receivable_products: { some: { store_depots: { store_id: storeId } } }
                },
                include: {
                    sell_payment_methods: true,
                    sell_receivable_products: { include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } }
                }
            })
            return NextResponse.json(storeAllSellsReceivable);
        } else if (storeId) {
            const storeTodaySellsReceivable = await prisma.sells_receivable.findMany(
                {
                    where: {
                        created_at: {
                            gte: new Date(todayStart!),
                            lt: new Date(todayEnd!),
                        },
                        OR: [
                            { sell_receivable_products: { some: { store_depots: { store_id: storeId } } } },
                        ]
                    },
                    include: {
                        sell_payment_methods: true,
                        sell_receivable_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
                    }
                }
            )
            return NextResponse.json(storeTodaySellsReceivable);
        }
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CANCEL/CONFIRM sell receivable
export async function PATCH(req: Request) {
    try {

        const { sellId, action } = await req.json();

        let sellPaymentMethods: sell_payment_methods[] = [];

        if (action === "confirm") {
            const confirmedSellReceivable = await prisma.sells_receivable.update({
                where: { id: sellId },
                data: { status: "COBRADA", payed_at: new Date() },
                include: { sell_receivable_products: true, sell_payment_methods: true }
            });

            for (const sellPaymentMethod of confirmedSellReceivable.sell_payment_methods) {
                const method = await prisma.sell_payment_methods.create({
                    data: {
                        quantity: sellPaymentMethod.quantity,
                        payment_method: sellPaymentMethod.payment_method,
                    },
                });
                sellPaymentMethods.push(method);
            }

            await prisma.$transaction(async (tx) => {
                const sellItem = await tx.sells.create({
                    data: { total_price: confirmedSellReceivable.total_price }
                });

                for (const method of sellPaymentMethods) {
                    await tx.sell_payment_methods.update({
                        where: { id: method.id }, data: { sells_id: sellItem.id }
                    });
                }

                for (const sellProduct of confirmedSellReceivable.sell_receivable_products) {
                    await tx.sell_products.create({
                        data: {
                            sell_id: sellItem.id,
                            units_quantity: sellProduct.units_quantity,
                            price: sellProduct.price,
                            store_depot_id: sellProduct.store_depot_id
                        }
                    })
                }
            });

            return new NextResponse("Venta realizada con éxito", { status: 200 });

        } else {
            const canceledSellReceivable = await prisma.sells_receivable.update({
                where: { id: sellId },
                data: { status: "CANCELADA" },
                include: { sell_receivable_products: true }
            });

            for (const sellReceivableProduct of canceledSellReceivable.sell_receivable_products) {
                await prisma.store_depots.update({
                    where: { id: sellReceivableProduct.store_depot_id },
                    data: { product_remaining_units: { increment: sellReceivableProduct.units_quantity } }
                })
            }
            return new NextResponse("Venta cancelada", { status: 200 });
        }
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}