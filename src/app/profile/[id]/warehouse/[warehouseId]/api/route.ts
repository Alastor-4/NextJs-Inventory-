import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all depots in warehouse
export async function GET(request: Request, { params }: { params: { id: string, warehouseId: string } }) {
    const ownerId = params.id
    const warehouseId = params.warehouseId

    if (ownerId && warehouseId) {
        const warehouseDepots = await prisma.warehouses.findFirst(
            {
                where: {id: parseInt(warehouseId)},
                include: {
                    depots: {include: {products: {include: {departments: true, characteristics: true, images: true}}}}
                }
            }
        )

        return NextResponse.json(warehouseDepots)
    }

    return new Response('La acción de obtener los usuarios ha fallado', {status: 500})
}

// Change owner's user role
export async function PATCH(req, res) {
    const {searchParams} = new URL(req.url)
    const userId = searchParams.get("userId")
    const {roleId} = await req.json()

    if (userId) {
        const updatedRole = await prisma.users.update({data: {role_id: roleId}, where: {id: parseInt(userId)}})

        return NextResponse.json(updatedRole)
    }

    return new Response('La acción de modificar rol ha fallado', {status: 500})
}

// Delete owner's user
export async function DELETE(req, res) {
    const {searchParams} = new URL(req.url)
    const userId = searchParams.get("userId")

    if (userId) {
        const updatedUser = await prisma.users.update({data: {work_for_user_id: null}, where: {id: parseInt(userId)}})

        return NextResponse.json(updatedUser)
    }

    return res.status(500).json({message: "La acción de eliminar trabajador ha fallado"})
}