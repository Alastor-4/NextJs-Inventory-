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
                store_open_days: true,
                store_reservation_days: true,
                store_depots: {include: {_count: true}}}
        }
    )

    return NextResponse.json(store)
}
