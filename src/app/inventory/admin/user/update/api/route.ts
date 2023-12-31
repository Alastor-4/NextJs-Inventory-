import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET user details
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const user = await prisma.users.findUnique({ where: { id: +userId! }, include: { roles: true } });

        return NextResponse.json(user);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE user role
export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const { roleId } = await req.json();

        const userWithRoleUpdated = await prisma.users.update({ data: { role_id: roleId }, where: { id: +userId! } })

        return NextResponse.json(userWithRoleUpdated);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}