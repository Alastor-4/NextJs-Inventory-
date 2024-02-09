import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET all owner's user workers
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ownerId = +searchParams.get("ownerId")!;

    if (ownerId) {
        const users = await prisma.users.findMany({ where: { work_for_user_id: ownerId }, include: { roles: true } });

        return NextResponse.json(users);
    }

    return new Response('La acción de obtener los usuarios ha fallado', { status: 500 })
}

// DELETE owner's user
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = +searchParams.get("userId")!;

    if (userId) {
        await prisma.stores.updateMany({data: {seller_user_id: null}, where: {seller_user_id: userId}})

        const updatedUser = await prisma.users.update({ data: { work_for_user_id: null, role_id: null }, where: { id: userId } });

        return NextResponse.json(updatedUser);
    }

    return new Response('La acción de eliminar trabajador ha fallado', { status: 500 })
}