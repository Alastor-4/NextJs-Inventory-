import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { users } from "@prisma/client";
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
            async authorize(credentials, req) {

                if (!credentials?.username || !credentials?.password) return null;

                const res = await axios.post("/api/auth/login", credentials);

                const user: users | null = await res.data;

                if (!user) return null;

                const passwordMatch = await compare(credentials.password, user.password_hash!);
                if (!passwordMatch) return null;

                if (!user.is_verified) return null;

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
        }
    }
}