import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get user store
export async function GET(req, res) {
    const {searchParams} = new URL(req.url)
    const storeId = searchParams.get("storeId")

    if (storeId) {
        const store = await prisma.roles.findUnique({where: {id: parseInt(storeId)}})

        return NextResponse.json(store)
    }

    return res.status(500).json({message: "La acción de modificar ha fallado"})
}
