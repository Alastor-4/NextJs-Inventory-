import { storeSellsDetailsProps } from '@/types/interfaces';
import { NextResponse } from 'next/server'
import logger from '@/utils/logger';
import { prisma } from "db";

// GET store products sells
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = +searchParams.get("sellerStoreId")!;
    const allSells = searchParams.get("allSells");

    if (storeId && allSells) {
        const storeAllSells: storeSellsDetailsProps[] = await prisma.sells.findMany(
            {
                where: {
                    OR: [
                        { sell_products: { some: { store_depots: { store_id: storeId } } } },
                        { reservations: { reservation_products: { some: { store_depots: { store_id: storeId } } } } }
                    ]
                },
                include: {
                    sell_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: true } } } } } },
                    reservations: {
                        where: { reservation_products: { some: { store_depots: { store_id: storeId } } } },
                        include: { reservation_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: true } } } } }, }, },
                    }
                }
            }
        )
        return NextResponse.json(storeAllSells);
    } else if (storeId) {
        const today = new Date();
        const todayStart = new Date(today.setUTCHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setUTCHours(23, 59, 59, 999));

        const storeTodaySells: storeSellsDetailsProps[] = await prisma.sells.findMany(
            {
                where: {
                    created_at: {
                        gte: todayStart,
                        lt: todayEnd,
                    },
                    OR: [
                        { sell_products: { some: { store_depots: { store_id: storeId } } } },
                        { reservations: { reservation_products: { some: { store_depots: { store_id: storeId } } } } }
                    ]
                },
                include: {
                    sell_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: true } } } } } },
                    reservations: {
                        where: { reservation_products: { some: { store_depots: { store_id: storeId } } } },
                        include: { reservation_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { depots: { include: { products: true } } } } }, }, },
                    }
                }
            }
        )
        return NextResponse.json(storeTodaySells);
    }
    else {
        logger.info(`Hay datos undefined que impiden pedir los datos a la bd, en la obtencion de las ventas de los productos en la tienda`)

        return new Response('La acción de obtener los datos de la tienda ha fallado', { status: 500 })
    }
}