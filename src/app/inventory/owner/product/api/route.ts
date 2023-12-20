import { utapi } from 'uploadthing/server';
import { NextResponse } from 'next/server'
import { prisma } from "db";

// Get all user products
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(<string>searchParams.get("userId"))

    const departments = await prisma.departments.findMany(
        {
            where: {
                products: { some: { owner_id: userId } }
            },
            include: {
                products: { include: { departments: true, characteristics: true, images: true } }
            }
        }
    )

    return NextResponse.json(departments)
}

declare type Data = any
// Create new user product
export async function POST(req: Request) {
    const { userId, name, description, departmentId, buyPrice, characteristics, images } = await req.json()

    let createObj = {
        data: {
            owner_id: userId ? parseInt(userId) : null,
            name,
            description: description ? description : null,
            department_id: departmentId ? parseInt(departmentId) : null,
            buy_price: buyPrice ? parseFloat(buyPrice) : null,
        }
    }

    if (characteristics) {
        // @ts-ignore
        createObj.data.characteristics = { createMany: { data: characteristics } }
        // @ts-ignore
        createObj.include = { characteristics: true }
    }

    if (images) {
        // @ts-ignore
        createObj.data.images = { createMany: { data: images } }
        // @ts-ignore
        createObj.include = createObj.include ? { ...createObj.include, images: true } : { images: true }
    }

    const newProduct = await prisma.products.create(createObj)

    return NextResponse.json(newProduct)
}

// Update user product
export async function PUT(req: Request) {
    const {
        id,
        name,
        description,
        departmentId,
        buyPrice,
        characteristics,
        deletedCharacteristics,
        images,
        deletedImages
    } = await req.json()

    let updateObj = {
        name,
        description: description ? description : null,
        department_id: departmentId ? parseInt(departmentId) : null,
        buy_price: buyPrice ? parseFloat(buyPrice) : null,
    }

    if (deletedCharacteristics) {
        await prisma.characteristics.deleteMany({ where: { id: { in: deletedCharacteristics } } })
    }

    if (deletedImages) {
        await utapi.deleteFiles(deletedImages.map((item: { fileKey: string }) => item.fileKey))
        await prisma.images.deleteMany({ where: { id: { in: deletedImages.map((item: { id: number }) => item.id) } } })
    }

    if (characteristics) {
        await prisma.characteristics.createMany({ data: characteristics.map((item: any) => ({ ...item, product_id: id })) })
    }

    if (images) {
        await prisma.images.createMany({ data: images.map((item: any) => ({ ...item, product_id: id })) })
    }

    const updatedProduct = await prisma.products.update(
        {
            data: updateObj, where: { id: parseInt(id) }
        }
    )

    return NextResponse.json(updatedProduct)
}

// Insert metadata from already uploaded images to a user product
export async function PATCH(req: Request) {
    const { productId, name, description, departmentId, buyPrice } = await req.json()
    //sync product images
    const updatedProduct = await prisma.products.update({ data: { name, description, department_id: parseInt(departmentId), buy_price: parseFloat(buyPrice) }, where: { id: parseInt(productId) } })

    return NextResponse.json(updatedProduct)
}

// Delete user role
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    if (productId) {
        const deletedProduct = await prisma.products.delete({ where: { id: parseInt(productId) } })

        return NextResponse.json(deletedProduct)
    }

    return new Response('La acción de eliminar ha fallado', { status: 500 })
}