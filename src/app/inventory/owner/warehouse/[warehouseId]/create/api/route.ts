import { NextResponse } from 'next/server';
import { prisma } from "db";

// Get all products without depots in warehouse
export async function GET(req: Request, { params }: { params: { warehouseId: string } }) {
    const { searchParams } = new URL(req.url)
    const ownerId = +searchParams.get("userId")!
    const warehouseId = +params.warehouseId

    if (ownerId && warehouseId) {
        const warehouseDepots = await prisma.departments.findMany(
            {
                where: {
                    AND: [
                        {
                            products: {
                                some: { owner_id: ownerId }
                            },
                        },
                        {
                            products: {
                                some: { depots: { none: { warehouse_id: warehouseId } } }
                            },
                        },
                    ]
                },
                include: {
                    products: {
                        where: { depots: { none: { warehouse_id: warehouseId } }, is_approved: false },
                        include: { departments: true, characteristics: true, images: true },
                    }
                }
            }
        )

        return NextResponse.json(warehouseDepots)
    }

    return new Response('La acción de obtener los depósitos ha fallado', { status: 500 })
}