import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET all user departments
export async function GET(req: Request) {
    try {
        const departments = await prisma.departments.findMany({
            where: { usersId: null },
        });

        return NextResponse.json(departments);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CREATE new user department
export async function POST(req: Request) {
    try {
        const { name, description } = await req.json();

        const newDepartment = await prisma.departments.create({
            data: { name, description }
        });

        return NextResponse.json(newDepartment);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE user department
export async function PUT(req: Request) {
    try {
        const { id, usersId, name, description } = await req.json();

        const updatedDepartment = await prisma.departments.update({
            where: { id }, data: { name, description, usersId }
        });

        return NextResponse.json(updatedDepartment)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE user product
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const departmentId = +searchParams.get("departmentId")!;

        const deletedDepartment = await prisma.departments.delete({
            where: { id: departmentId }
        });

        return NextResponse.json(deletedDepartment);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}