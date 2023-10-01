import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get store details
export async function GET(request: Request, { params }: { params: { id: string, sellerStoreId: string } }) {
    const userId = parseInt(params.id)
    const storeId = parseInt(params.sellerStoreId)

    const store = await prisma.stores.findFirst(
        {
            where: {OR: [{id: storeId, owner_id: userId}, {id: storeId, seller_user_id: userId}]},
            include: {
                store_open_days: {orderBy: {week_day_number: "asc"}},
                store_reservation_days: {orderBy: {week_day_number: "asc"}},
                store_depots: {include: {_count: true}}}
        }
    )

    return NextResponse.json(store)
}

// Change store auto open time
export async function PUT(request: Request, { params }: { params: { sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const store = await prisma.stores.findUnique({where: {id: storeId}})
    const updatedStore = await prisma.stores.update({data: {auto_open_time: !store.auto_open_time}, where: {id: storeId}})

    return NextResponse.json(updatedStore)
}

// Change store auto reservation time
export async function PATCH(request: Request, { params }: { params: { sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const store = await prisma.stores.findUnique({where: {id: storeId}})
    const updatedStore = await prisma.stores.update({data: {auto_reservation_time: !store.auto_reservation_time}, where: {id: storeId}})

    return NextResponse.json(updatedStore)
}
