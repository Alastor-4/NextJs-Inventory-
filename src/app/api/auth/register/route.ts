import { NextResponse } from 'next/server'
import {prisma} from "db";

function checkTokenValidity(token: string) {
    const decodedData = token
    if (decodedData) {
        //token validity check passed

        return decodedData
    }

    return false
}

// Verify user
export async function GET(req: Request) {
    const {searchParams} = new URL(req.url)
    const token = searchParams.get("token")

    //verify token validity

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

    //ToDo: when user is created, send token to user email to allow verification process

    return NextResponse.json(
        {
            status: "ok",
            message: `Usuario registrado en el sistema. Siga las instrucciones del correo enviado a ${newUser.mail} para terminar el proceso`,
            user: newUser,
        }
    )
}