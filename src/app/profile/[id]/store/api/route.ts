import { NextResponse } from 'next/server'
import { prisma } from "db";

// Get all user stores
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id

    const stores = await prisma.stores.findMany({ where: { owner_id: parseInt(userId) }, include: { seller_user: true } })

    return NextResponse.json(stores)
}

// Create new user store
export async function POST(req: Request) {
    const { ownerId, name, description, slogan, address, sellerUserId, fixed_seller_profit_percentage, fixed_seller_profit_quantity, online_catalog, online_reservation } = await req.json()

    const newStore = await prisma.stores.create({ data: { owner_id: ownerId, name, description, slogan, address, seller_user_id: sellerUserId, fixed_seller_profit_percentage, fixed_seller_profit_quantity, online_catalog, online_reservation } })

    return NextResponse.json(newStore)
}

// Update user store
export async function PUT(req: Request) {
    const { storeId, name, description, slogan, address, sellerUserId, fixed_seller_profit_percentage, fixed_seller_profit_quantity, online_catalog, online_reservation } = await req.json()

    const updatedStore = await prisma.stores.update({ data: { name, description, slogan, address, seller_user_id: sellerUserId, fixed_seller_profit_percentage, fixed_seller_profit_quantity, online_catalog, online_reservation }, where: { id: storeId } })

    return NextResponse.json(updatedStore)
}

// Delete user store
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get("storeId")

    if (storeId) {
        const deletedStore = await prisma.stores.delete({ where: { id: parseInt(storeId) } })

        return NextResponse.json(deletedStore)
    }

    return new Response('La acción de eliminar ha fallado', { status: 500 })
}