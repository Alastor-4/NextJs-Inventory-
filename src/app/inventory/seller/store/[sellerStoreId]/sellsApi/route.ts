import { storeSellsDetailsProps } from '@/types/interfaces';
import { NextResponse } from 'next/server'
import logger from '@/utils/logger';
import utc from "dayjs/plugin/utc";
import { prisma } from "db";
import dayjs from "dayjs";

dayjs.extend(utc);

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
        const todayStart = dayjs.utc().set("h", 0).set("m", 0).set("s", 0);
        const todayEnd = todayStart.add(1, "day");

        const storeTodaySells: storeSellsDetailsProps[] = await prisma.sells.findMany(
            {
                where: {
                    created_at: {
                        gte: new Date(todayStart.format("YYYY-MM-DD")),
                        lt: new Date(todayEnd.format("YYYY-MM-DD")),
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