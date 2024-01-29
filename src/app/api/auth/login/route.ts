import { prisma } from "@/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { username } = await req.json();

        const user = await prisma.users.findUnique({
            where: { username }
        })

        return NextResponse.json(user);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}