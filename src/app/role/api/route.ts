import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all user roles
export async function GET(req, res) {
    const roles = await prisma.roles.findMany()

    return NextResponse.json(roles)
}

// Create new user roles
export async function POST(req, res) {
    const {name, description} = await req.json()

    const newRole = await prisma.roles.create({data: {name, description}})

    return NextResponse.json(newRole)
}

// Update user role
export async function PUT(req, res) {
    const {roleId, name, description} = await req.json()

    const updatedRole = await prisma.roles.update({data: {name, description}, where: {id: roleId}})

    return NextResponse.json(updatedRole)
}

// Delete user role
export async function DELETE(req, res) {
    const {searchParams} = new URL(req.url)
    const roleId = searchParams.get("roleId")

    if (roleId) {
        const deletedRole = await prisma.roles.delete({where: {id: parseInt(roleId)}})

        return NextResponse.json(deletedRole)
    }

    return res.status(500).json({message: "La acción de eliminar ha fallado"})
}