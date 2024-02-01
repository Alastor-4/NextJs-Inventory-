import { sendVerifyMail } from "@/utils/serverActions";
import { withAxiom, AxiomRequest } from "next-axiom";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from 'next/server';
import { prisma } from "db";

export const GET = withAxiom(async (req: AxiomRequest) => {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (token) {
        const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey";

        try {
            const tokenPayload: string | JwtPayload = jwt.verify(token, jwtPrivateKey);

            if (typeof tokenPayload !== 'string' && tokenPayload.email) {
                const userByEmail = await prisma.users.findUnique({ where: { mail: tokenPayload.email } });
                if (userByEmail) {
                    return NextResponse.json({
                        status: "ok",
                        message: `Token verificado correctamente`,
                        email: `${userByEmail?.mail}`
                    });
                }
            }
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
            } else {
                return new NextResponse("El token de verificación proporcionado no es correcto", { status: 406 });
            }
        } catch (e) {
            return new NextResponse("El token de verificación proporcionado no es correcto", { status: 406 });
        }
    } else {
        return new NextResponse("No fue proporcionado el token de verificación del usuario", { status: 400 });
    }
})

export const POST = withAxiom(async (req: AxiomRequest) => {
    const log = req.log.with({ scope: 'auth/register' })

    const { username, passwordHash, name, email, phone } = await req.json()

    const newUser = await prisma.users.create({
        data: {
            username: username,
            mail: email,
            phone: phone,
            name: name,
            password_hash: passwordHash,
        }
    });

    log.info("Nuevo usuario registrado")

    sendVerifyMail(username, newUser.mail);

    return NextResponse.json(
        {
            status: "ok",
            message: `Usuario registrado correctamente. Siga las instrucciones del correo enviado a ${newUser.mail} para terminar el proceso`,
            user: newUser,
        }
    )
});