import { checkAdminRoleMiddleware } from '@/utils/middlewares';
import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET all users
export async function GET(req: Request) {
    try {
        const checkAdminRoleResult = await checkAdminRoleMiddleware(req);

        if (checkAdminRoleResult) {
            return checkAdminRoleResult
        };

        const users = await prisma.users.findMany({ include: { roles: true } });

        return NextResponse.json(users);
    } catch (error) {
        console.log('[USER_GET_ALL]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// VERIFY user
export async function PUT(req: Request) {
    try {
        const checkAdminRoleResult = await checkAdminRoleMiddleware(req);

        if (checkAdminRoleResult) {
            return checkAdminRoleResult
        };

        const { userId } = await req.json();

        const verifiedUser = await prisma.users.update({
            data: { is_verified: true },
            where: { id: +userId! }
        });

        return NextResponse.json(verifiedUser);
    } catch (error) {
        console.log('[USER_VERIFY]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// TOGGLE isActive user
export async function PATCH(req: Request) {
    try {
        const checkAdminRoleResult = await checkAdminRoleMiddleware(req);

        if (checkAdminRoleResult) {
            return checkAdminRoleResult
        };

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const { isActive } = await req.json();

        const updatedUser = await prisma.users.update({
            data: { is_active: isActive },
            where: { id: +userId! }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.log('[USER_TOGGLE_ACTIVE_STATE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}