import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET department details by departmentId
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const departmentId = +searchParams.get("departmentId")!;

        const department = await prisma.departments.findUnique({
            where: { id: departmentId }, include: { products: true }
        });

        return NextResponse.json(department);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}