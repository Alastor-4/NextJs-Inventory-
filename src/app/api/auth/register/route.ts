import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from 'next/server';
import * as process from "process";
import { prisma } from "db";
//import logger from "@/utils/logger";
import { withAxiom, AxiomRequest } from "next-axiom"
import { Resend } from 'resend';
import VerifyUserTemplate from '@/components/email-templates/VerifyUserTemplate';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (token) {
        const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey";

        try {
            const tokenPayload: string | JwtPayload = jwt.verify(token, jwtPrivateKey);

            if (typeof tokenPayload !== 'string' && tokenPayload.username) {
                const user = await prisma.users.findUnique({ where: { username: tokenPayload.username } });

                if (user && user.is_active) {
                    if (user.is_verified) {
                        return new NextResponse("Este usuario ya está verificado", { status: 202 });
                    } else {
                        await prisma.users.update({
                            where: { username: tokenPayload.username },
                            data: { is_verified: true }
                        });

                        return new NextResponse("Usuario verificado correctamente. Ahora puede autenticarse en el sistema", { status: 201 });
                    }
                } else {
                    return new NextResponse("Este usuario no existe o no esta activo", { status: 406 });
                }
            }
        } catch (e) {
            return new NextResponse("El token de verificación proporcionado no es correcto", { status: 406 });
        }
    } else {
        return new NextResponse("No fue proporcionado el token de verificación del usuario", { status: 400 });
    }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = withAxiom(async (req: AxiomRequest) => {
    req.log.info("Ejecutada función de registrar usuario")

    const { username, passwordHash, name, mail, phone } = await req.json()

    const user = await prisma.users.findFirst({
        where: {
            OR: [
                { username: username },
                { mail: mail },
                { phone: phone },
            ]
        }
    })

    if (user) new NextResponse("Usuario, correo o teléfono ya se encuentra registrado en el sistema", { status: 202 });

    const newUser = await prisma.users.create({
        data: {
            username: username,
            mail: mail,
            phone: phone,
            name: name,
            password_hash: passwordHash,
        }
    });

    const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey"
    const verificationToken = jwt.sign({ username: username }, jwtPrivateKey, { expiresIn: "24h" });

    // You can create intermediate loggers
    const log = req.log.with({ scope: 'register' })

    const {error } = await resend.emails.send({
        from: 'Dan <onboarding@inventarioplus.online>',
        to: newUser.mail,
        subject: "Verificación de usuario",
        react: VerifyUserTemplate({ link: `${process.env.NEXTAUTH_URL}/register/verify/${verificationToken}` }),
    });

    if (error) {
        log.error(`Ha fallado el envio del email al usuario ${username}`)
    } else {
        log.info('Usuario verificado correctamente', newUser)
    }

    return NextResponse.json(
        {
            status: "ok",
            message: `Usuario registrado correctamente. Siga las instrucciones del correo enviado a ${newUser.mail} para terminar el proceso`,
            user: newUser,
        }
    )
});