import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all user roles
export async function GET() {
    const roles = await prisma.roles.findMany()

    return NextResponse.json(roles)
}

// Create new user roles
export async function POST(req: Request) {
    const {name, description} = await req.json()

    const newRole = await prisma.roles.create({data: {name, description}})

    return NextResponse.json(newRole)
}

// Update user role
export async function PUT(req: Request) {
    const {roleId, name, description} = await req.json()

    const updatedRole = await prisma.roles.update({data: {name, description}, where: {id: roleId}})

    return NextResponse.json(updatedRole)
}

// Delete user role
export async function DELETE(req: Request) {
    const {searchParams} = new URL(req.url)
    const roleId = searchParams.get("roleId")

    if (roleId) {
        const deletedRole = await prisma.roles.delete({where: {id: parseInt(roleId)}})

        return NextResponse.json(deletedRole)
    }

    return new Response('La acción de eliminar ha fallado', {status: 500})
}