import { NextResponse } from 'next/server'
import { prisma } from "db";
import logger from '@/utils/logger';

interface Params {
    params: { sellerStoreId: string }
}


// Get store details
export async function GET(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url)

    const userIdParam = searchParams.get("id")
    const storeIdParam = params.sellerStoreId

    if (userIdParam && storeIdParam) {
        const userId = parseInt(userIdParam)
        const storeId = parseInt(storeIdParam)

        const store = await prisma.stores.findFirst(
            {
                where: { OR: [{ id: storeId, owner_id: userId }, { id: storeId, seller_user_id: userId }] },
                include: {
                    store_open_days: { orderBy: { week_day_number: "asc" } },
                    store_reservation_days: { orderBy: { week_day_number: "asc" } },
                    store_depots: true,
                }
            }
        )

        return NextResponse.json(store)
    } else {

        logger.info(`Hay datos undefined que impiden pedir los datos a la bd, en la obtencion de los datos de la tienda`)

        return new Response('La acción de obtener los datos de la tienda ha fallado', { status: 500 })
    }
}

// Change store auto open time
export async function PUT(req: Request, { params }: Params) {

    const storeIdParam = params.sellerStoreId

    if (storeIdParam) {
        const storeId = parseInt(storeIdParam)

        const store = await prisma.stores.findUnique({ where: { id: storeId } })
        const updatedStore = await prisma.stores.update({ data: { auto_open_time: !store?.auto_open_time }, where: { id: storeId } })

        return NextResponse.json(updatedStore)
    } else {
        return new Response('La acción de cambiar el estado de la tienda ha fallado', { status: 500 })
    }
}

// Change store auto reservation time
export async function PATCH(req: Request, { params }: Params) {

    const storeIdParam = params.sellerStoreId

    if (storeIdParam) {
        const storeId = parseInt(storeIdParam)

        const store = await prisma.stores.findUnique({ where: { id: storeId } })
        const updatedStore = await prisma.stores.update({ data: { auto_reservation_time: !store?.auto_reservation_time }, where: { id: storeId } })

        return NextResponse.json(updatedStore)
    } else {
        return new Response('La acción de cambiar el estado de la tienda ha fallado', { status: 500 })
    }
}
