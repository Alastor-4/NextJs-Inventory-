"use server"

import {prisma} from "db";

export async function getAllRoles() {
    "use server"
    return prisma.roles.findMany()
}

export async function createNewRole(name, description) {
    "use server"
    return await prisma.roles.create({data: {name, description}})
}

export async function updateRole(name, description) {
    "use server"
    return prisma.roles.update({data: {name, description}})
}

export async function deleteRole(id) {
    "use server"
    return prisma.roles.delete(id)
}