import { NextResponse } from 'next/server';
import { prisma } from "db";
import { compare } from 'bcrypt';
import { hashPassword } from '@/utils/serverActions';

// GET account data
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = +searchParams.get("userId")!;

        const accountData = await prisma.users.findUnique({ where: { id: userId } });

        if (accountData) {
            const { mail: email, username, name, phone } = accountData;
            return NextResponse.json({ email, username, name, phone });
        }

        return new NextResponse("Error obteniendo los datos de la cuenta", { status: 406 });

    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CHANGE account data
export async function PUT(req: Request) {
    try {
        const { userId, username, name, email, phone } = await req.json();

        const updatedAccount = await prisma.users.update({
            where: { id: +userId! },
            data: { name: name, username: username, mail: email, phone: phone }
        });

        return NextResponse.json(updatedAccount);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CHANGE account password
export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = +searchParams.get("userId")!;

        const { oldPassword, passwordHash } = await req.json();

        const user = await prisma.users.findUnique({ where: { id: userId } });

        const passwordMatch = await compare(oldPassword, user?.password_hash!);

        if (!passwordMatch) return NextResponse.json("Contraseña antigua incorrecta");

        const userWithPasswordUpdated = await prisma.users.update({ data: { password_hash: passwordHash }, where: { id: +userId! } });

        if (userWithPasswordUpdated) return NextResponse.json("Contraseña cambiada correctamente", { status: 201 });

        return new NextResponse("Error cambiando la contraseña", { status: 406 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}