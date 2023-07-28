import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all user roles
export async function GET() {
    const roles = await prisma.roles.findMany()

    return NextResponse.json(roles)
}

// Create new user roles
export async function POST(request: Request) {
    const {name, description} = request.json()

    const newRole = await prisma.roles.create({data: {name, description}})

    return NextResponse.json(newRole)
}

// Update user role
export async function PUT(request: Request) {
    const {roleId, name, description} = request.json()

    const updatedRole = await prisma.roles.update({data: {name, description}, where: {id: roleId}})

    return NextResponse.json(updatedRole)
}

// Delete user role
export async function DELETE(request: Request) {
    const {roleId} = request.json()

    const deletedRole = await prisma.roles.delete({where: {id: roleId}})

    return NextResponse.json(deletedRole)
}