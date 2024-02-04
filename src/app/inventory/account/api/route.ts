import { NextResponse } from 'next/server';
import { prisma } from "db";

// CHANGE account data
export async function PUT(req: Request) {
    try {
        const { userId, username, name, email, phone } = await req.json()

        const updatedAccount = await prisma.users.update({
            where: { id: +userId! },
            data: {
                name: name,
                username: username,
                mail: email,
                phone: phone
            }
        });

        if (updatedAccount) return new NextResponse("Datos actualizados correctamente", { status: 200 });

        return new NextResponse("Error actualizando los datos", { status: 406 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CHANGE account password
export async function PATCH(req: Request) {
    try {
        const { userId, passwordHash } = await req.json();

        const userWithPasswordUpdated = await prisma.users.update({ data: { password_hash: passwordHash }, where: { id: +userId! } });

        if (userWithPasswordUpdated) return new NextResponse("Contraseña cambiada correctamente", { status: 201 });

        return new NextResponse("Error cambiando la contraseña", { status: 406 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}