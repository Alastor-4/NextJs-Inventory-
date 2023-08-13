import { NextResponse, NextRequest } from 'next/server'
import {prisma} from "db";

// Get all user products
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id

    const products = await prisma.products.findMany({where: {owner_id: parseInt(userId)}, include: {departments: true, charateristics: true}})

    return NextResponse.json(products)
}

// Create new user product
export async function POST(req: Request, res) {
    const data = await req.formData()

    const userId = data.get('userId')
    const name = data.get('name')
    const description = data.get('description')
    const departmentId = data.get('departmentId')
    const buyPrice = data.get('buyPrice')
    const characteristics = data.get('characteristics')
    const image = ''

    let insertItem = {
        owner_id: userId ? parseInt(userId) : null,
        name,
        description: description ? description : null,
        department_id: departmentId ? parseInt(departmentId) : null,
        buy_price: buyPrice ? parseFloat(buyPrice) : null,
        image,
    }

    if (characteristics) insertItem.charateristics = {createMany: {data: JSON.parse(characteristics)}}

    const newProduct = await prisma.products.create(
        {
            data: insertItem,
            include: {
                charateristics: !!characteristics
            }
        }
    )

    return NextResponse.json(newProduct)
}

// Update user product
export async function PUT(req, res) {
    const {productId, name, description, departmentId, buyPrice} = await req.json()

    const updatedProduct = await prisma.products.update({data: {name, description, department_id: parseInt(departmentId), buy_price: parseFloat(buyPrice)}, where: {id: parseInt(productId)}})

    return NextResponse.json(updatedProduct)
}

// Delete user role
export async function DELETE(req, res) {
    const {searchParams} = new URL(req.url)
    const productId = searchParams.get("productId")

    if (productId) {
        const deletedProduct = await prisma.products.delete({where: {id: parseInt(productId)}})

        return NextResponse.json(deletedProduct)
    }

    return res.status(500).json({message: "La acción de eliminar ha fallado"})
}