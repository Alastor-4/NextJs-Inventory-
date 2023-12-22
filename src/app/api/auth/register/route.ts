import jwt, { JwtPayload } from "jsonwebtoken";
import { sendMail } from "@/mailer-service";
import { NextResponse } from 'next/server';
import logger from "@/utils/logger";
import * as process from "process";
import { prisma } from "db";

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

export async function POST(req: Request) {
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

    try {
        await sendMail(
            "Verificación de usuario",
            newUser.mail,
            `Visite el siguiente link para verificar su usuario ${process.env.APP_BASE_URL}/verification/${verificationToken}`
        )
    } catch (e) {
        logger.info(`Ha fallado el envio del email al usuario ${username}`)
    }

    return NextResponse.json(
        {
            status: "ok",
            message: `Usuario registrado correctamente. Siga las instrucciones del correo enviado a ${newUser.mail} para terminar el proceso`,
            user: newUser,
        }
    )
}