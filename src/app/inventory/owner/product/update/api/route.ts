import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET product details by productId
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        const product = await prisma.products.findUnique({
            where: { id: +productId! },
            include: { departments: true, characteristics: true, images: true }
        })

        return NextResponse.json(product);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// approve product
export async function PUT(req: Request) {
    try {
        const { productId } = await req.json()

        //insert new images for an existing product
        const updatedProduct = await prisma.products.update({
            data: {is_approved: true},
            where: {id: +productId!},
            include: { departments: true, characteristics: true, images: true, created_by_user: true },
        })

        return NextResponse.json(updatedProduct);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}