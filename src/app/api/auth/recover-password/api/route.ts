import { sendRecoverPasswordEmail } from '@/utils/serverActions';
import { withAxiom, AxiomRequest } from "next-axiom";
import { NextResponse } from 'next/server';
import { prisma } from "db";
import jwt, {JwtPayload} from "jsonwebtoken";

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
    let mail

    try {
        const { token, passwordHash } = await req.json()

        if (token && passwordHash) {
            const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey"

            const tokenPayload: string | JwtPayload = jwt.verify(token, jwtPrivateKey)

            if (typeof tokenPayload !== 'string' && tokenPayload.email) {
                mail = tokenPayload.email

                const userByEmail = await prisma.users.findUnique({
                    where: {
                        mail: mail,
                        is_verified: true,
                        is_active: true
                    }
                })

                if (userByEmail) {
                    await prisma.users.update({ where: { mail: mail }, data: { password_hash: passwordHash } });

                    return new NextResponse("Contraseña cambiada satisfactoriamente", { status: 200 });
                }

                return new NextResponse("No hay usuario activo asociado a los datos proporcionados", { status: 400 });
            }

            return new NextResponse("Los datos proporcionados no son correctos", { status: 400 });
        }

        return new NextResponse("Los datos proporcionados no son correctos", { status: 400 });
    } catch (e) {
        return new NextResponse("Los datos proporcionados no son correctos", { status: 400 });
    }
})