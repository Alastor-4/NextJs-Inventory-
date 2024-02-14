import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET all user stores
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const stores = await prisma.stores.findMany({
            where: { owner_id: +userId! },
            include: { seller_user: true, store_open_days: true, store_reservation_days: true }
        })

        return NextResponse.json(stores)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CREATE new user store
export async function POST(req: Request) {
    try {
        const {
            ownerId,
            name,
            description,
            slogan,
            address,
            sellerUserId,
            fixed_seller_profit_percentage,
            fixed_seller_profit_quantity,
            online_catalog,
            online_reservation,
            fixed_seller_daily_profit_quantity
        } = await req.json()

        const newStore = await prisma.stores.create({
            data: {
                owner_id: ownerId,
                name,
                description,
                slogan,
                address,
                seller_user_id: sellerUserId,
                fixed_seller_profit_percentage,
                fixed_seller_profit_quantity,
                fixed_seller_daily_profit_quantity,
                online_catalog,
                online_reservation,
            }
        })

        return NextResponse.json(newStore)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE user store
export async function PUT(req: Request) {
    try {
        const {
            storeId,
            name,
            description,
            slogan,
            address,
            sellerUserId,
            fixed_seller_profit_percentage,
            fixed_seller_profit_quantity,
            fixed_seller_daily_profit_quantity,
            online_catalog,
            online_reservation
        } = await req.json()

        const updatedStore = await prisma.stores.update({
            data: {
                name,
                description,
                slogan,
                address,
                seller_user_id: sellerUserId,
                fixed_seller_profit_percentage,
                fixed_seller_profit_quantity,
                fixed_seller_daily_profit_quantity,
                online_catalog,
                online_reservation
            }, where: { id: storeId }
        })

        return NextResponse.json(updatedStore)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE user store
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get("storeId");

        const deletedStore = await prisma.stores.delete({ where: { id: +storeId! } })

        return NextResponse.json(deletedStore)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}