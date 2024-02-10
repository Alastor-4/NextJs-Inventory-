import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET receivable sells
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const storeId = +searchParams.get("storeId")!;
    // const todayStart = searchParams.get("todayStart");
    // const todayEnd = searchParams.get("todayEnd");

    const sellsReceivable = await prisma.sells_receivable.findMany({
        where: {
            sell_receivable_products: { some: { store_depots: { store_id: storeId } } }
        },
        include: {
            sell_receivable_products: { include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } }
        }
    })

    // const storeTodaySalesReceivableCreated = await prisma.sells_receivable.findMany(
    //     {
    //         where: {
    //             created_at: {
    //                 gte: new Date(todayStart!),
    //                 lt: new Date(todayEnd!),
    //             },
    //             sell_receivable_products: { some: { store_depots: { store_id: storeId } } },
    //         },
    //         include: {
    //             sell_receivable_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
    //         }
    //     }
    // )

    // const storeTodaySalesReceivablePayed = await prisma.sells_receivable.findMany(
    //     {
    //         where: {
    //             payed_at: {
    //                 gte: new Date(todayStart!),
    //                 lt: new Date(todayEnd!),
    //             },
    //             sell_receivable_products: { some: { store_depots: { store_id: storeId } } },
    //         },
    //         include: {
    //             sell_receivable_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
    //         }
    //     }
    // )

    // const storeAllSalesReceivablePending = await prisma.sells_receivable.findMany(
    //     {
    //         where: {
    //             status: "PENDIENTE",
    //             sell_receivable_products: { some: { store_depots: { store_id: storeId } } },
    //         },
    //         include: {
    //             sell_receivable_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
    //         }
    //     }
    // )

    return NextResponse.json(sellsReceivable)
    // return NextResponse.json({ storeTodaySalesReceivableCreated, storeTodaySalesReceivablePayed, storeAllSalesReceivablePending })
}

// CANCEL/CONFIRM sell receivable
export async function PATCH(req: Request) {
    try {

        const { sellId, action } = await req.json();

        if (action === "confirm") {
            const confirmedSellReceivable = await prisma.sells_receivable.update({
                where: { id: sellId },
                data: { status: "COBRADA", payed_at: new Date() },
                include: { sell_receivable_products: true }
            });

            await prisma.$transaction(async (tx) => {
                const sellItem = await tx.sells.create({
                    data: {
                        payment_method: confirmedSellReceivable.payment_method,
                        total_price: confirmedSellReceivable.total_price,
                    }
                })

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