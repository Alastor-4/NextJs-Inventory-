import { NextResponse } from 'next/server';
import { prisma } from "db";

// Get user store
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (storeId) {
        const store = await prisma.stores.findUnique({
            where: { id: parseInt(storeId) },
            include: {
                seller_user: true,
                store_open_days: true,
                store_reservation_days: true
            }
        });

        return NextResponse.json(store);
    }

    return new Response('La acción de eliminar ha fallado', { status: 500 });
}
