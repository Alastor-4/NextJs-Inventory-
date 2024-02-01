import { sendRecoverPasswordEmail } from '@/utils/serverActions';
import { withAxiom, AxiomRequest } from "next-axiom";
import { NextResponse } from 'next/server';
import { prisma } from "db";

export const POST = withAxiom(async (req: AxiomRequest) => {

    const { email } = await req.json();

    const user = await prisma.users.findUnique({ where: { mail: email } });

    if (user) {
        sendRecoverPasswordEmail(email);

        return new NextResponse(`Verifique el correo enviado a ${email} para terminar el proceso`, { status: 200 })
    }
    return new NextResponse("No se encontró usuario con este correo");
});

export const PATCH = withAxiom(async (req: AxiomRequest) => {
    try {
        const { email, passwordHash } = await req.json();

        if (email) {
            const user = await prisma.users.update({ where: { mail: email }, data: { password_hash: passwordHash } });

            if (user) {
                return new NextResponse("Contraseña cambiada satisfactoriamente", { status: 200 });
            }
            return new NextResponse("No se encontró usuario con este correo", { status: 404 });
        }
        return new NextResponse("Correo es obligatorio", { status: 400 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
})