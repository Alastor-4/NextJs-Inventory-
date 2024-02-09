import { NextResponse } from 'next/server'
import { prisma } from "db";

// GET store products sells
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = +searchParams.get("storeId")!;

    const todayStart = searchParams.get("todayStart");
    const todayEnd = searchParams.get("todayEnd");

    const storeTodaySalesReceivableCreated = await prisma.sells_receivable.findMany(
        {
            where: {
                created_at: {
                    gte: new Date(todayStart!),
                    lt: new Date(todayEnd!),
                },
                sell_receivable_products: { some: { store_depots: { store_id: storeId } } },
            },
            include: {
                sell_receivable_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
            }
        }
    )

    const storeTodaySalesReceivablePayed = await prisma.sells_receivable.findMany(
        {
            where: {
                payed_at: {
                    gte: new Date(todayStart!),
                    lt: new Date(todayEnd!),
                },
                sell_receivable_products: { some: { store_depots: { store_id: storeId } } },
            },
            include: {
                sell_receivable_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
            }
        }
    )

    const storeAllSalesReceivablePending = await prisma.sells_receivable.findMany(
        {
            where: {
                status: "PENDIENTE",
                sell_receivable_products: { some: { store_depots: { store_id: storeId } } },
            },
            include: {
                sell_receivable_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
            }
        }
    )

    return NextResponse.json({ storeTodaySalesReceivableCreated, storeTodaySalesReceivablePayed, storeAllSalesReceivablePending })
}