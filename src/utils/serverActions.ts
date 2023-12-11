'use server'

import { hashSync } from "bcrypt"

export async function hashPassword(password: string) {
    return hashSync(password, 10);
}