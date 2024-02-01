'use server'

import { VerifyUserTemplate } from "@/components/email-templates/VerifyUserTemplate";
import { RecoverPasswordTemplate } from "@/components/email-templates/RecoverPasswordTemplate";
import { hashSync } from "bcrypt";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const jwtPrivateKey = process.env.JWT_PRIVATE_KEY ?? "fakePrivateKey";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function hashPassword(password: string) {
    return hashSync(password, 10);
}

export async function sendVerifyMail(username: string, toMail: string) {
    const verificationToken = jwt.sign({ username: username }, jwtPrivateKey, { expiresIn: "24h" });
    const link = `${process.env.NEXTAUTH_URL}/register/verify/${verificationToken}`

    return resend.emails.send({
        from: 'InventarioPlus <onboarding@inventarioplus.online>',
        to: toMail,
        subject: "Verificación de usuario",
        react: VerifyUserTemplate({ link }),
        text: "Visite el siguiente link para verificar su correo " + link
    })
}

export async function sendRecoverPasswordEmail(email: string) {
    const verificationToken = jwt.sign({ email }, jwtPrivateKey, { expiresIn: "24h" });
    const link = `${process.env.NEXTAUTH_URL}/recover-password/${verificationToken}`

    return resend.emails.send({
        from: 'InventarioPlus <onboarding@inventarioplus.online>',
        to: email,
        subject: "Cambio de contraseña",
        react: RecoverPasswordTemplate({ link }),
        text: "Visite el siguiente link para cambiar su contraseña " + link
    })
}