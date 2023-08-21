import { NextResponse, NextRequest } from 'next/server'
import {prisma} from "db";

// Get all user products
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id

    const products = await prisma.products.findMany({where: {owner_id: parseInt(userId)}, include: {departments: true, characteristics: true}})

    return NextResponse.json(products)
}

// Create new user product
export async function POST(req: Request, res) {
    const {userId, name, description, departmentId, buyPrice, characteristics, images} = await req.json()

    let createObj = {data: {
            owner_id: userId ? parseInt(userId) : null,
            name,
            description: description ? description : null,
            department_id: departmentId ? parseInt(departmentId) : null,
            buy_price: buyPrice ? parseFloat(buyPrice) : null,
        }}

    if (characteristics) {
        createObj.data.characteristics = {createMany: {data: characteristics}}

        createObj.include = {characteristics: true}
    }

    if (images) {
        createObj.data.images = {createMany: {data: images}}

        createObj.include = createObj.include ? { ...createObj.include, images: true} : { images: true }
    }

    const newProduct = await prisma.products.create(createObj)

    return NextResponse.json(newProduct)
}

// Update user product
export async function PUT(req, res) {
    const {productId, name, description, departmentId, buyPrice} = await req.json()

    const updatedProduct = await prisma.products.update({data: {name, description, department_id: parseInt(departmentId), buy_price: parseFloat(buyPrice)}, where: {id: parseInt(productId)}})

    return NextResponse.json(updatedProduct)
}

// Insert metadata from already uploaded images to a user product
export async function PATCH(req, res) {
    const {productId, addProductImages, deleteProductImages} = await req.json()
    //sync product images
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