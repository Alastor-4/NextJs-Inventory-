import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const usersId = +searchParams.get("usersId")!;

        const departmentsByUserId = await prisma.departments.findMany({
            where: { usersId }
        });

        return NextResponse.json(departmentsByUserId);
    } catch (error) {
        console.log('[DEPARTMENT_GET_All_BY_USERID]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}