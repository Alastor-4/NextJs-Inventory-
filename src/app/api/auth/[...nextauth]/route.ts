import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Usuario",
            credentials: {
                username: { label: "User", type: "text", placeholder: "usuario" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials, req) {
                const res = await fetch("/your/endpoint", {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                })
                const user = await res.json()

                // If no error and we have user data, return it
                if (res.ok && user) {
                    return user
                }
                // Return null if user data could not be retrieved
                return null
            },
        }),
    ],
    jwt: {
        maxAge: 60 * 60 * 24 * 3 // 3 days,
    },
})

export { handler as GET, handler as POST }