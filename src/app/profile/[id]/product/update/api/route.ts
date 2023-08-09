import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get role details
export async function GET(req, res) {
    const {searchParams} = new URL(req.url)
    const productId = searchParams.get("productId")

    if (productId) {
        const role = await prisma.roles.findUnique({where: {id: parseInt(productId)}})

        return NextResponse.json(role)
    }

    return res.status(500).json({message: "La acción de obtener detalles ha fallado"})
}
