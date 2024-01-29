import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { users } from "@prisma/client";
import * as process from "process";
import { compare } from "bcrypt"
import axios from "axios";

export const nextAuthOptions: NextAuthOptions = {
    pages: {
        signIn: '/',
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "User", type: "text", placeholder: "usuario" },
                password: { label: "Contraseña", type: "password" }
            },
            // @ts-ignore
            async authorize(credentials, req) {

                if (!credentials?.username || !credentials?.password) throw new Error("usuario y contraseña requeridos")

                const res = await axios.post(
                    `${process.env.NEXTAUTH_URL}/login`,
                    credentials,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        }
                    }
                )

                const user: users | null = await res.data;

                if (!user) throw new Error("usuario no encontrado")

                if (!user.is_verified) throw new Error("usuario no verificado")

                const passwordMatch = await compare(credentials.password, user.password_hash!)
                if (!passwordMatch) throw new Error("contraseña incorrecta")

                return {
                    id: user.id,
                    username: user.username,
                    role_id: user.role_id,
                    is_verified: user.is_verified,
                    is_active: user.is_active,
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        maxAge: 60 * 60 * 24 * 3 // 3 days,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    username: user.username,
                    role_id: user.role_id,
                    is_verified: user.is_verified,
                    is_active: user.is_active
                }
            }
            return token
        },
        async session({ session, token }: any) {
            return {
                ...session,
                user: {
                    id: token.id,
                    username: token.username,
                    role_id: token.role_id,
                    is_verified: token.is_verified,
                    is_active: token.is_active
                }
            }
        },
    }
}