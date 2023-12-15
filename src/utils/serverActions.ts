'use server'

import { hashSync } from "bcrypt"

export function hashPassword(password: string) {
    return hashSync(password, 10);
}