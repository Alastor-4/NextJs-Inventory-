import { NextResponse } from 'next/server';
import { prisma } from "db";

// Get all owner's user workers
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")

    if (ownerId) {
        const users = await prisma.users.findMany(
            {
                where: { work_for_user_id: parseInt(ownerId) }, include: { roles: true }
            }
        )

        return NextResponse.json(users)
    }

    return new Response('La acción de obtener los usuarios ha fallado', { status: 500 })
}

// Change owner's user role
export async function PATCH(req: Request) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const { roleId } = await req.json()

    if (userId) {
        const updatedRole = await prisma.users.update({ data: { role_id: roleId }, where: { id: parseInt(userId) } })

        return NextResponse.json(updatedRole)
    }

    return new Response('La acción de modificar rol ha fallado', { status: 500 })
}

// Delete owner's user
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (userId) {
        const updatedUser = await prisma.users.update({ data: { work_for_user_id: null, role_id: null }, where: { id: parseInt(userId) } })

        return NextResponse.json(updatedUser)
    }

    return new Response('La acción de eliminar trabajador ha fallado', { status: 500 })
}