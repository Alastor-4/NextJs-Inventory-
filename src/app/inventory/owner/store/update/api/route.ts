import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET store details by storeId
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get("storeId");

        const store = await prisma.stores.findUnique({
            where: { id: +storeId! },
            include: {
                seller_user: true,
                store_open_days: true,
                store_reservation_days: true
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        console.log('[STORE_GET_ONE_BY_ID]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}