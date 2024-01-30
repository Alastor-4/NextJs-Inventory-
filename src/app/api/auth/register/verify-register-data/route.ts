import { NextResponse } from "next/server";
import { prisma } from '../../../../../db';

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { username, phone, email } = body;

        if (!username) return new NextResponse("Usuario es requerido", { status: 400 });
        if (!phone) return new NextResponse("Número de teléfono es requerido", { status: 400 });
        if (!email) return new NextResponse("Correo es requerido", { status: 400 });

        const messages: { "key": string, "message": string }[] = [];

        const userUsername = await prisma.users.findUnique({ where: { username: username } });

        if (userUsername) messages.push({ key: "username", message: "Ya existe este nombre de usuario en el sistema" });

        const userPhone = await prisma.users.findUnique({ where: { phone: phone } });

        if (userPhone) messages.push({ key: "phone", message: "Ya existe un usuario registrado con este teléfono" });

        const userEmail = await prisma.users.findUnique({ where: { mail: email } });

        if (userEmail) messages.push({ key: "email", message: "Ya existe un usuario registrado con este correo" });

        return NextResponse.json(messages);

    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}