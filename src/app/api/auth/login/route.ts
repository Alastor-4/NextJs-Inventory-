import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function POST(req: Request) {
    try {
        const { username } = await req.json();

        if (!username) {
            return new NextResponse("Nombre es requerido", { status: 400 })
        }
        const user = await prisma.users.findUnique({ where: { username } });

        return NextResponse.json(user);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}