import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const ownerId = +searchParams.get("ownerId")!;

        const departmentsByOwnerId = await prisma.departments.findMany(
            { where: { OR: [{ usersId: null }, { usersId: ownerId }] } }
        );

        return NextResponse.json(departmentsByOwnerId);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}