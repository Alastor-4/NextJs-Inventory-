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

// Create new user store
export async function POST(req, res) {
    const {ownerId, name, description, slogan, address, sellerUserId} = await req.json()

    const newStore = await prisma.stores.create({data: {owner_id: ownerId, name, description, slogan, address, seller_user_id: sellerUserId}})

    return NextResponse.json(newStore)
}

// Update user store
export async function PUT(req, res) {
    const {storeId, name, description, slogan, address, sellerUserId} = await req.json()

    const updatedStore = await prisma.stores.update({data: {name, description, slogan, address, seller_user_id: sellerUserId}, where: {id: storeId}})

    return NextResponse.json(updatedStore)
}

// Delete user store
export async function DELETE(req, res) {
    const {searchParams} = new URL(req.url)
    const storeId = searchParams.get("storeId")

    if (storeId) {
        const deletedStore = await prisma.stores.delete({where: {id: parseInt(storeId)}})

        return NextResponse.json(deletedStore)
    }

    return res.status(500).json({message: "La acción de eliminar ha fallado"})
}