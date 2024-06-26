import { AxiomRequest, withAxiom } from "next-axiom";
import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET user details
export const GET = withAxiom(async (req: AxiomRequest) => {
    const log = req.log.with({ scope: 'admin/user' })

    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const user = await prisma.users.findUnique({ where: { id: +userId! }, include: { roles: true } });

        return NextResponse.json(user);
    } catch (error) {
        log.error(String(error))
        return new NextResponse("Internal Error", { status: 500 });
    }
})

// UPDATE user role
export const PATCH = withAxiom(async (req: AxiomRequest) => {
    const log = req.log.with({ scope: 'admin/user' })

    try {
        const { searchParams } = new URL(req.url);
        const userId = +searchParams.get("userId")!;

        const { roleId } = await req.json();

        const userWithRoleUpdated = await prisma.users.update({ data: { role_id: roleId }, where: { id: userId } })

        return NextResponse.json(userWithRoleUpdated);
    } catch (error) {
        log.error(String(error))
        return new NextResponse("Internal Error", { status: 500 });
    }
})

// UPDATE user password
export const PUT = withAxiom(async (req: AxiomRequest) => {
    const log = req.log.with({ scope: 'admin/user' })

    try {
        const { searchParams } = new URL(req.url);
        const userId = +searchParams.get("userId")!;
        const { passwordHash } = await req.json();

        const userWithPasswordUpdated = await prisma.users.update({ data: { password_hash: passwordHash }, where: { id: +userId! } });

        if (userWithPasswordUpdated) return new NextResponse("Contraseña cambiada correctamente", { status: 201 });

        return new NextResponse("Error cambiando la contraseña", { status: 406 });
    } catch (error) {
        log.error(String(error))
        return new NextResponse("Internal Error", { status: 500 });
    }
})

// CREATE main warehouse for an owner user
export const POST = withAxiom(async (req: AxiomRequest) => {
    const log = req.log.with({ scope: 'admin/user' })

    try {
        const { ownerId } = await req.json();

        const warehouse = await prisma.warehouses.create({ data: { owner_id: +ownerId, name: "Almacén 1", description: "Almacén principal" } })

        return NextResponse.json(warehouse);
    } catch (error) {
        log.error(String(error))
        return new NextResponse("Internal Error", { status: 500 });
    }
})