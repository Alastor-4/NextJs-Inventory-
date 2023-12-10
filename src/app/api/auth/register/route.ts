import { NextResponse } from 'next/server'
import {prisma} from "db";
import jwt from "jsonwebtoken"
import {sendMail} from "@/mailer-service";
import * as process from "process";

// Verify user
export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const token = searchParams.get("token")

    if (token) {
        const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey"

        try {
            const tokenPayload = jwt.verify(token, jwtPrivateKey)

            // @ts-ignore
            if (tokenPayload.username) {
                // @ts-ignore
                const user = await prisma.users.findUnique({where: {username: tokenPayload.username}})

                if (user && user.is_active) {
                    if (user.is_verified) {
                        return NextResponse.json({status: "error", message: "Este usuario ya está verificado"})
                    } else {
                        // @ts-ignore
                        await prisma.users.update({is_verified: true}, {where: {username: tokenPayload.username}})

                        return NextResponse.json({status: "ok", message: "Usuario verificado correctamente. Ahora puede autenticarse en el sistema"})
                    }
                } else {
                    return NextResponse.json({status: "error", message: "Este usuario no existe o no esta activo"})
                }
            }
        } catch (e) {
            return NextResponse.json({status: "error", message: "El token de verificación proporcionado no es correcto"})
        }

        return NextResponse.json({status: "error", message: "El token de verificación proporcionado no es correcto"})
    } else {
        return NextResponse.json({status: "error", message: "No fue proporcionado el token de verificación del usuario"})
    }
}

// Create new user
export async function POST(req: Request) {
    const {username, passwordHash, name, mail, phone} = await req.json()

    const user = await prisma.users.findFirst({
        where: {
            OR: [
                {username: username},
                {mail: mail},
                {phone: phone},
            ]
        }
    })

    if (user) {
        return NextResponse.json({status: "error", message: "Usuario, correo o teléfono ya se encuentra registrado en el sistema"})
    }

    const newUser = await prisma.users.create({
        data: {
            username: username,
            mail: mail,
            phone: phone,
            name: name,
            password_hash: passwordHash,
        }
    })

    const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey"
    const verificationToken = jwt.sign({username: username}, jwtPrivateKey, {expiresIn: "24h"})

    try {
        await sendMail(
            "Verificación de usuario",
            newUser.mail,
            `Visite el siguiente link para verificar su usuario ${process.env.APP_BASE_URL}/api/auth/register?token=${verificationToken}`
            )
    } catch (e) {
        console.log(e)
    }

    return NextResponse.json(
        {
            status: "ok",
            message: `Usuario registrado en el sistema. Siga las instrucciones del correo enviado a ${newUser.mail} para terminar el proceso`,
            user: newUser,
        }
    )
}