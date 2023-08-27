import { NextResponse } from 'next/server'
import {prisma} from "db";

// Owner find a user to add it as worker
export async function GET(req, res) {
    const {searchParams} = new URL(req.url)
    const username = searchParams.get("username") ?? ""
    const phone = searchParams.get("phone") ?? ""

    //find a user with provided username and phone, without role and not a worker for any owner
    const user = await prisma.users.findFirst(
        {
            where: {username: username, phone: phone, work_for_user_id: null, role_id: null},
        }
    )

    return NextResponse.json(user)
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