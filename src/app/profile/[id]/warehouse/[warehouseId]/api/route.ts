import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all depots in warehouse
export async function GET(request: Request, { params }: { params: { id: string, warehouseId: string } }) {
    const ownerId = params.id
    const warehouseId = params.warehouseId

    if (ownerId && warehouseId) {
        const warehouseDepots = await prisma.depots.findMany(
            {
                where: {warehouse_id: parseInt(warehouseId)},
                include: {
                    products: {include: {departments: true, characteristics: true, images: true}}
                }
            }
        )

        return NextResponse.json(warehouseDepots)
    }

    return new Response('La acción de obtener los usuarios ha fallado', {status: 500})
}

//ToDo: decide to update an existing depot of a warehouse for the same product or create a new one

// Create warehouse depot
export async function PUT(req, res) {
    const {warehouseId, productId, insertedById, productTotalUnits} = await req.json()

    const createdDepot = await prisma.depots.create(
        {
            data: {
                warehouse_id: parseInt(warehouseId),
                product_id: parseInt(productId),
                product_total_units: parseInt(productTotalUnits),
                product_total_remaining_units: parseInt(productTotalUnits),
                inserted_by_id: parseInt(insertedById)
            }
        }
    )

    return NextResponse.json(createdDepot)
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

// Delete warehouse depot
export async function DELETE(req, res) {
    const {searchParams} = new URL(req.url)
    const depotId = searchParams.get("depotId")

    if (depotId) {
        const deletedDepot = await prisma.depots.delete({where: {id: parseInt(depotId)}})

        return NextResponse.json(deletedDepot)
    }

    return res.status(500).json({message: "La acción de eliminar depósito ha fallado"})
}