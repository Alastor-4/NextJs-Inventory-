import { NextResponse } from 'next/server'
import { prisma } from "db";
import dayjs from "dayjs";

// GET store products sells
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = +searchParams.get("storeId")!;

    const todayStart = dayjs().set("h", 0).set("m", 0).set("s", 0)
    const todayEnd = todayStart.add(24, "hours")

    const storeTodaySalesReceivableCreated = await prisma.sells_receivable.findMany(
        {
            where: {
                created_at: {
                    gte: new Date(todayStart.format()),
                    lt: new Date(todayEnd.format()),
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
                    gte: new Date(todayStart.format()),
                    lt: new Date(todayEnd.format()),
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