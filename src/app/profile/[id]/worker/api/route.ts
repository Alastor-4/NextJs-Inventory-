import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all owner's user workers
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const ownerId = params.id

    if (ownerId) {
        const users = await prisma.users.findMany(
            {
                where: {work_for_user_id: parseInt(ownerId)}, include: {roles: true}
            }
        )

        return NextResponse.json(users)
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