import { NextResponse } from 'next/server'
import { prisma } from "db";

// Get all user warehouses
export async function GET(req: Request) {
    const warehouses = await prisma.warehouses.findMany({ include: { users: true } })

    return NextResponse.json(warehouses)
}

// Create new user warehouses
export async function POST(req: Request) {
    const { name, description, address, ownerId } = await req.json()

    const newWarehouse = await prisma.warehouses.create({ data: { name, description, address, owner_id: ownerId } })

    return NextResponse.json(newWarehouse)
}

// Update user warehouse
export async function PUT(req: Request) {
    const { warehouseId, name, description, address } = await req.json()

    const updatedWarehouse = await prisma.warehouses.update({ data: { name, description, address }, where: { id: warehouseId } })

    return NextResponse.json(updatedWarehouse)
}

// Delete user warehouse
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const warehouseId = searchParams.get("warehouseId")

    if (warehouseId) {
        const deletedWarehouse = await prisma.warehouses.delete({ where: { id: parseInt(warehouseId) } })

        return NextResponse.json(deletedWarehouse)
    }

    return new Response('La acción de eliminar ha fallado', { status: 500 })
}