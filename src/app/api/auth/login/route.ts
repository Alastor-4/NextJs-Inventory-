import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username } = body;
        if (!username) {
            return new NextResponse("Nombre es requerido", { status: 400 })
        }
        const user = await prisma.users.findUnique({
            where: { username }
        })
        if (!user) {
            return new NextResponse("No existe usuario con ese nombre", { status: 400 })
        }
        return NextResponse.json(user);
    } catch (error) {
        console.log('[USER_LOGIN]', error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}