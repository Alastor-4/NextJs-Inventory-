import { NextResponse } from 'next/server';
import { prisma } from "db";
import {AxiomRequest, withAxiom} from "next-axiom";

// GET all users
export const GET = withAxiom(async (req: AxiomRequest)=> {
    const log = req.log.with({ scope: 'admin/user' })

    try {
        const users = await prisma.users.findMany({ include: { roles: true } });

        return NextResponse.json(users);
    } catch (error) {
        log.error(String(error))
        return new NextResponse("Internal Error", { status: 500 });
    }
})

// VERIFY user
export const PUT = withAxiom(async (req: AxiomRequest)=> {
    const log = req.log.with({ scope: 'admin/user' })

    try {
        const { userId } = await req.json();

        const verifiedUser = await prisma.users.update({
            data: { is_verified: true },
            where: { id: +userId! }
        });

        return NextResponse.json(verifiedUser);
    } catch (error) {
        log.error(String(error))
        return new NextResponse("Internal Error", { status: 500 });
    }
})

// TOGGLE isActive user
export const PATCH = withAxiom(async (req: AxiomRequest)=> {
    const log = req.log.with({ scope: 'admin/user' })

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const { isActive } = await req.json();

        const updatedUser = await prisma.users.update({
            data: { is_active: isActive },
            where: { id: +userId! }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        log.error(String(error))
        return new NextResponse("Internal Error", { status: 500 });
    }
})