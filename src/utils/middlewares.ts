import { nextAuthOptions } from '@/app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server'

export async function checkAdminRoleMiddleware(req: Request) {
    const session = await getServerSession(nextAuthOptions);

    if (session?.user.role_id !== 1) {
        return new NextResponse("No está autorizado a realizar esta consulta", { status: 401 });
    }

    return null;
}