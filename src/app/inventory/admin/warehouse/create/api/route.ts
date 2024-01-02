import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET all users with owner role
export async function GET(req: Request) {
    try {
        const users = await prisma.users.findMany({ where: { role_id: 2 } })

        return NextResponse.json(users);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}