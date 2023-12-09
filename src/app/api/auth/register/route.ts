import { NextResponse } from 'next/server'
import {prisma} from "db";
import jwt from "jsonwebtoken"

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

    //ToDo: send token to user email to allow verification process
    const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey"
    const verificationToken = jwt.sign({username: username}, jwtPrivateKey, {expiresIn: "24h"})
    console.log("verification token", verificationToken)

    return NextResponse.json(
        {
            status: "ok",
            message: `Usuario registrado en el sistema. Siga las instrucciones del correo enviado a ${newUser.mail} para terminar el proceso`,
            user: newUser,
        }
    )
}