import { storeSellsDetailsProps } from '@/types/interfaces';
import { NextResponse } from 'next/server'
import logger from '@/utils/logger';
import { prisma } from "db";
import dayjs from "dayjs";

// GET store products sells
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = +searchParams.get("storeId")!;
    const allSells = searchParams.get("loadAllSells");

    if (storeId && (allSells === 'true')) {
        const storeAllSells: storeSellsDetailsProps[] | null = await prisma.sells.findMany(
            {
                where: {
                    OR: [
                        { sell_products: { some: { store_depots: { store_id: storeId } } } },
                        { reservations: { reservation_products: { some: { store_depots: { store_id: storeId } } } } }
                    ]
                },
                include: {
                    sell_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
                    reservations: {
                        where: { reservation_products: { some: { store_depots: { store_id: storeId } } } },
                        include: { reservation_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } } } } } } }, }, },
                    }
                }
            }
        )
        return NextResponse.json(storeAllSells);
    } else if (storeId) {
        const todayStart = dayjs().set("h", 0).set("m", 0).set("s", 0)
        const todayEnd = todayStart.add(24, "hours")

        const storeTodaySells: storeSellsDetailsProps[] | null = await prisma.sells.findMany(
            {
                where: {
                    created_at: {
                        gte: new Date(todayStart.format()),
                        lt: new Date(todayEnd.format()),
                    },
                    OR: [
                        { sell_products: { some: { store_depots: { store_id: storeId } } } },
                        { reservations: { reservation_products: { some: { store_depots: { store_id: storeId } } } } }
                    ]
                },
                include: {
                    sell_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
                    reservations: {
                        where: { reservation_products: { some: { store_depots: { store_id: storeId } } } },
                        include: { reservation_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: { include: { departments: true } } } } } } }, }, },
                    }
                }
            }
        )
        return NextResponse.json(storeTodaySells);
    }

    logger.info(`Hay datos undefined que impiden pedir los datos a la bd, en la obtencion de las ventas de los productos en la tienda`)

    return new Response('La acción de obtener los datos de la tienda ha fallado', { status: 500 })
}

export async function PUT(req: Request) {
    const { sell_product_id, returned_quantity, returned_reason } = await req.json();

    const price = await prisma.sell_products.findUnique({ where: { id: sell_product_id }, include: { store_depots: true } });

    const sellProduct = await prisma.sell_products.update({
        where: { id: +sell_product_id! }, data: {
            returned_reason: returned_reason,
            units_returned_quantity: { increment: returned_quantity },
            units_quantity: { decrement: returned_quantity },
            store_depots: { update: { product_remaining_units: { increment: returned_quantity } } },
            price: { decrement: (returned_quantity * +price?.store_depots?.sell_price!) },
            sells: { update: { total_price: { decrement: (returned_quantity * +price?.store_depots?.sell_price!) } } }
        }
    });

    return new NextResponse('Se ha realizado la devolución con éxito', { status: 200 })
}