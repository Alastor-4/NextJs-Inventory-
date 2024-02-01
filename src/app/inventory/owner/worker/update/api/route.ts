import { NextResponse } from "next/server";
import { prisma } from "@/db";

// GET worker details
export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const user = await prisma.users.findUnique({ where: { id: +userId! }, include: { roles: true } });

        return NextResponse.json(user);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CHANGE worker role
export async function PATCH(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = +searchParams.get("userId")!;
    const { roleId } = await req.json();

    if (userId) {
        const updatedRole = await prisma.users.update({ data: { role_id: roleId }, where: { id: userId } });

        return NextResponse.json(updatedRole);
    }

    return new Response('La acción de modificar rol ha fallado', { status: 500 })
}
