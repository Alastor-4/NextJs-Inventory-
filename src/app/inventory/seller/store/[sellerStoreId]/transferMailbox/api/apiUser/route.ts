import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const userId = +<string>searchParams.get('userId')

    const result = await prisma.users.findFirst({
        where: {
            id: userId
        }
    })
    return NextResponse.json(result)
}