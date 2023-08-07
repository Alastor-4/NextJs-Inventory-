import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all user
export async function GET(req, res) {
    const users = await prisma.users.findMany({include: {roles: true}})

    return NextResponse.json(users)
}

// Verify user
export async function PUT(req, res) {
    const {searchParams} = new URL(req.url)
    const userId = searchParams.get("userId")

    if (userId) {
        const updatedRole = await prisma.users.update({data: {is_verified: true}, where: {id: parseInt(userId)}})

        return NextResponse.json(updatedRole)
    }

    return new Response('La acción de verificar ha fallado', {status: 500})
}

// activate/deactivate user
export async function PATCH(req, res) {
    const {searchParams} = new URL(req.url)
    const userId = searchParams.get("userId")
    const {isActive} = await req.json()

    if (userId) {
        const updatedRole = await prisma.users.update({data: {is_active: isActive}, where: {id: parseInt(userId)}})

        return NextResponse.json(updatedRole)
    }

    return new Response('La acción de activar/desactivar ha fallado', {status: 500})
}

// Delete user
export async function DELETE(req, res) {
    const {searchParams} = new URL(req.url)
    const userId = searchParams.get("userId")

    if (userId) {
        const deletedRole = await prisma.roles.delete({where: {id: parseInt(userId)}})

        return NextResponse.json(deletedRole)
    }

    return new Response('La acción de eliminar ha fallado', {status: 500})
}