import { NextResponse } from 'next/server'
import {prisma} from "db";

// User details
export async function GET(req, res) {
    const {searchParams} = new URL(req.url)
    const userId = searchParams.get("userId")

    const users = await prisma.users.findUnique({where: {id: parseInt(userId)}, include: {roles: true}})

    return NextResponse.json(users)
}

// Change user role
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