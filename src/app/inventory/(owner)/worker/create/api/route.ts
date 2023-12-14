import { NextResponse } from 'next/server';
import { prisma } from "db";

// Owner find a user to add it as worker
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username") ?? ""
    const phone = searchParams.get("phone") ?? ""

    //find a user with provided username and phone, without role and not a worker for any owner
    const user = await prisma.users.findFirst(
        {
            where: { username: username, phone: phone, work_for_user_id: null, role_id: null },
        }
    )

    return NextResponse.json(user)
}

// Make worker a new user
export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")

    const { userId } = await req.json()

    if (ownerId && userId) {
        const updatedRole = await prisma.users.update({ data: { work_for_user_id: parseInt(ownerId) }, where: { id: parseInt(userId) } })

        return NextResponse.json(updatedRole)
    }

    return new Response('La acción de agregar usuario ha fallado', { status: 500 })
}