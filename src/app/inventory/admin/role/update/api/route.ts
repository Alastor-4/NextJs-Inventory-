import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET role details by roleId
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const roleId = searchParams.get("roleId");

        const role = await prisma.roles.findUnique({ where: { id: +roleId! } });

        return NextResponse.json(role);
    } catch (error) {
        console.log('[ROLE_GET_ONE_BY_ID]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
