import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare, compareSync, hashSync } from "bcrypt"
import { nextAuthOptions } from "./options"

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST }