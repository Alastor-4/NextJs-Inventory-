import { NextResponse } from 'next/server'
import {prisma} from "db";

// User details
export async function GET(req, res) {
    const {searchParams} = new URL(req.url)
    const warehouseId = searchParams.get("warehouseId")

    if (warehouseId) {
        const warehouse = await prisma.warehouses.findUnique({where: {id: parseInt(warehouseId)}, include: {users: true}})

        return NextResponse.json(warehouse)
    }

    return new Response('La acción de modificar almacen ha fallado', {status: 500})
}

// Change user role
export async function PATCH(req, res) {
    const {warehouseId, ownerId, name, description, address} = await req.json()

    if (warehouseId) {
        const updatedRole = await prisma.warehouses.update({data: {owner_id: ownerId, name, description, address}, where: {id: parseInt(warehouseId)}})

        return NextResponse.json(updatedRole)
    }

    return new Response('La acción de modificar almacén ha fallado', {status: 500})
}