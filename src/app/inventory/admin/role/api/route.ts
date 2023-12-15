import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/options';
import { checkAdminRoleMiddleware } from '@/utils/middlewares';
import { NextResponse } from 'next/server'
import { prisma } from "db";

// GET all user roles
export async function GET(req: Request) {
    try {
        const checkAdminRoleResult = await checkAdminRoleMiddleware(req);

        if (checkAdminRoleResult) {
            return checkAdminRoleResult
        };

        const roles = await prisma.roles.findMany();

        return NextResponse.json(roles);
    } catch (error) {
        console.log('[ROLE_GET_ALL]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CREATE new user roles
export async function POST(req: Request) {
    try {
        const checkAdminRoleResult = await checkAdminRoleMiddleware(req);

        if (checkAdminRoleResult) {
            return checkAdminRoleResult
        };

        const { name, description } = await req.json();

        const newRole = await prisma.roles.create({ data: { name, description } });

        return NextResponse.json(newRole);
    } catch (error) {
        console.log('[ROLE_CREATE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE user role
export async function PUT(req: Request) {
    try {
        const checkAdminRoleResult = await checkAdminRoleMiddleware(req);

        if (checkAdminRoleResult) {
            return checkAdminRoleResult
        };

        const { roleId, name, description } = await req.json();

        const updatedRole = await prisma.roles.update({ data: { name, description }, where: { id: roleId } });

        return NextResponse.json(updatedRole);
    } catch (error) {
        console.log('[ROLE_UPDATE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE user role
export async function DELETE(req: Request) {
    try {
        const checkAdminRoleResult = await checkAdminRoleMiddleware(req);

        if (checkAdminRoleResult) {
            return checkAdminRoleResult
        };

        const { searchParams } = new URL(req.url);
        const roleId = searchParams.get("roleId");

        const deletedRole = await prisma.roles.delete({ where: { id: +roleId! } })

        return NextResponse.json(deletedRole);
    } catch (error) {
        console.log('[ROLE_DELETE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}