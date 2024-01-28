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