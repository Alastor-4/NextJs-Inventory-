import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get product details
export async function GET(req, res) {
    const {searchParams} = new URL(req.url)
    const productId = searchParams.get("productId")

    if (productId) {
        const product = await prisma.products.findUnique({where: {id: parseInt(productId)}, include: {departments: true, characteristics: true, images: true}})

        return NextResponse.json(product)
    }

    return res.status(500).json({message: "La acción de obtener detalles ha fallado"})
}
