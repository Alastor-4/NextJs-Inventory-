import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET all user departments
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const departments = await prisma.departments.findMany(
            {
                where: {
                    products: { some: { owner_id: +userId! } }
                },
                include: {
                    products: { include: { departments: true, characteristics: true, images: true } }
                }
            }
        )

        return NextResponse.json(departments)
    } catch (error) {
        console.log('[PRODUCT_GET_ALL]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CREATE new user product
export async function POST(req: Request) {
    try {
        const { userId, name, description, departmentId, buyPrice, characteristics } = await req.json();

        let createObj = {
            data: {
                owner_id: +userId!,
                name,
                description,
                department_id: +departmentId!,
                buy_price: +buyPrice!,
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
        console.log('[PRODUCT_CREATE]', error);
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
                data: updateObj, where: { id: parseInt(id) }
            }
        )

        return NextResponse.json(updatedProduct)
    } catch (error) {
        console.log('[PRODUCT_UPDATE]', error);
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
        console.log('[PRODUCT_UPDATE_METADATA_IMAGE]', error);
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
        console.log('[PRODUCT_DELETE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}