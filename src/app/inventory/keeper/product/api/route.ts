import { utapi } from "@/server/uploadthing";
import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET all user products
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get("ownerId");

        const departments = await prisma.departments.findMany(
            {
                where: {
                    products: { some: { owner_id: +ownerId! } }
                },
                include: {
                    products: {
                        include: { departments: true, characteristics: true, images: true, created_by_user: true },
                        where: { owner_id: +ownerId! }
                    }
                }
            }
        )

        return NextResponse.json(departments);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CREATE new user product
export async function POST(req: Request) {
    try {
        const { ownerId, userId, name, description, departmentId, buyPrice, characteristics } = await req.json();

        let createObj = {
            data: {
                owner_id: +ownerId!,
                name,
                description,
                department_id: +departmentId!,
                buy_price: +buyPrice!,
                is_approved: false,
                created_by_id: +userId!,
            },
        }

        if (characteristics) {
            // @ts-ignore
            createObj.data.characteristics = { createMany: { data: characteristics } }
            // @ts-ignore
            createObj.include = { characteristics: true }
        }

        const newProduct = await prisma.products.create(createObj)

        return NextResponse.json(newProduct)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE user product
export async function PUT(req: Request) {
    try {
        const {
            id,
            name,
            description,
            departmentId,
            buyPrice,
            characteristics,
            deletedCharacteristics,
            deletedImages
        } = await req.json()

        let updateObj: { name: string; description: string; department_id: number; buy_price: number } = {
            name,
            description,
            department_id: +departmentId!,
            buy_price: +buyPrice!,
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

        const updatedProduct = await prisma.products.update(
            {
                data: updateObj, where: { id: +id }
            }
        )

        return NextResponse.json(updatedProduct)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// INSERT images metadata from already uploaded product images
export async function PATCH(req: Request) {
    try {
        const { productId, productImages } = await req.json()

        const data = productImages.map((item: any) => ({ product_id: +productId, fileKey: item.key, fileUrl: item.url }))

        //insert new images for an existing product
        const updatedProduct = await prisma.images.createMany({ data: data })

        return NextResponse.json(updatedProduct);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE user product
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        const deletedProduct = await prisma.products.delete({ where: { id: +productId! } })

        return NextResponse.json(deletedProduct)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}