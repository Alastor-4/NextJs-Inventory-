import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get role details
export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const roleId = searchParams.get("roleId")

    if (roleId) {
        const role = await prisma.roles.findUnique({where: {id: parseInt(roleId)}})

        return NextResponse.json(role)
    }

    return new Response('La acción de modificar ha fallado', {status: 500})
}
