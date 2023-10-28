import { NextResponse } from 'next/server'
import { prisma } from "db";

// Get all warehouse depots
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(request.url)

    const warehouseId = searchParams.get("warehouseId")

    if (warehouseId) {
        const warehouseDepots = await prisma.depots.findMany(
            {
                where: { warehouse_id: parseInt(warehouseId) },
                include: {
                    products: { include: { departments: true, images: true, characteristics: true } }
                },
            },
        )

        return NextResponse.json(warehouseDepots)
    }

    return new Response('La acción de obtener los depósitos ha fallado', { status: 500 })
}

// Create new user store
export async function POST(req: Request) {
    const { ownerId, name, description, slogan, address, sellerUserId } = await req.json()

    const newStore = await prisma.stores.create({
        data: {
            owner_id: ownerId,
            name,
            description,
            slogan,
            address,
            seller_user_id: sellerUserId
        }
    })

    return NextResponse.json(newStore)
}

// Update user store
export async function PUT(req: Request) {
    const { storeId, name, description, slogan, address, sellerUserId } = await req.json()

    const updatedStore = await prisma.stores.update({
        data: {
            name,
            description,
            slogan,
            address,
            seller_user_id: sellerUserId
        }, where: { id: storeId }
    })


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