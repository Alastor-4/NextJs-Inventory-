import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get all user products
export async function GET(req, res) {
    const {searchParams} = new URL(req.url)
    const userId = searchParams.get("userId")

    const products = await prisma.products.findMany({where: {owner_id: userId}})

    return NextResponse.json(products)
}

// Create new user product
export async function POST(req, res) {
    const {userId, name, description, departmentId, buyPrice} = await req.json()

    const newProduct = await prisma.products.create({data: {owner_id: userId, name, description, department_id: departmentId, buy_price: buyPrice}})

    return NextResponse.json(newProduct)
}

// Update user product
export async function PUT(req, res) {
    const {productId, name, description, departmentId, buyPrice} = await req.json()

    const updatedProduct = await prisma.products.update({data: {name, description, department_id: departmentId, buy_price: buyPrice}, where: {id: productId}})

    return NextResponse.json(updatedProduct)
}

// Delete user role
export async function DELETE(req, res) {
    const {searchParams} = new URL(req.url)
    const productId = searchParams.get("roleId")

    if (productId) {
        const deletedProduct = await prisma.products.delete({where: {id: parseInt(productId)}})

        return NextResponse.json(deletedProduct)
    }

    return res.status(500).json({message: "La acción de eliminar ha fallado"})
}