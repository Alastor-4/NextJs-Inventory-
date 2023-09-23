import {NextResponse} from 'next/server'
import {prisma} from "db";

// Get all products without depots in warehouse
export async function GET(request: Request, {params}: { params: { id: string, warehouseId: string } }) {
    const ownerId = params.id
    const warehouseId = params.warehouseId

    if (ownerId && warehouseId) {
        const warehouseDepots = await prisma.departments.findMany(
            {
                where: {
                    AND: [
                        {
                            products: {
                                some: {owner_id: parseInt(ownerId)}
                            },
                        },
                        {
                            products: {
                                some: {depots: {none: {warehouse_id: parseInt(warehouseId)}}}
                            },
                        },
                    ]
                },
                include: {
                    products: {
                        where: {depots: {none: {warehouse_id: parseInt(warehouseId)}}},
                        include: {departments: true, characteristics: true, images: true},
                    }
                }
            }
        )

        return NextResponse.json(warehouseDepots)
    }

    return new Response('La acción de obtener los depósitos ha fallado', {status: 500})
}