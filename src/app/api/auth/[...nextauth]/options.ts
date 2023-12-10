import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { compare, compareSync, hashSync } from "bcrypt"

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
            async authorize(credentials, req) {

                if (!credentials?.username || !credentials?.password) return null;

                const res = await fetch(`${process.env.NEXTAUTH_URL}/login`, {
                    method: "POST",
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                });

                const user = await res.json();

                if (!user) return null;

                // const passwordMatch = await compare(credentials.password, user.password_hash);

                // if (!passwordMatch) return null;

                //TODO: descomentar cuando se haga el register

                if (!user.is_verified) return null;

                return {
                    id: user.id
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        maxAge: 60 * 60 * 24 * 3 // 3 days,
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                return {
                    ...token, id: user.id,
                }
            }
            return token
        },
        async session({ session, token }: any) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                }
            }
        }
    }
}