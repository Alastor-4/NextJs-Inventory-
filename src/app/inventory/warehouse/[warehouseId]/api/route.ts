import { NextResponse } from 'next/server'
import { prisma } from "db";

// Get all depots in warehouse
export async function GET(request: Request, { params }: { params: { warehouseId: string } }) {
    const { searchParams } = new URL(request.url)
    const ownerId = parseInt(<string>searchParams.get("userId"))
    const warehouseId = params.warehouseId

    if (ownerId && warehouseId) {
        const warehouseDepots = await prisma.departments.findMany({
            where: {
                products: {
                    some: {
                        depots: {
                            some: { warehouse_id: parseInt(warehouseId) }
                        }
                    }
                }
            },
            include: {
                products: {
                    where: {
                        depots: {
                            some: { warehouse_id: parseInt(warehouseId) }
                        }
                    },
                    include:
                    {
                        departments: true,
                        characteristics: true,
                        images: true,
                        depots: {
                            where: { warehouse_id: parseInt(warehouseId) }
                        }
                    }
                }
            }
        })

        return NextResponse.json(warehouseDepots)
    }

    return new Response('La acción de obtener los depósitos ha fallado', { status: 500 })
}

// Create warehouse depot
export async function POST(req: Request) {
    const { warehouseId, productId, insertedById, productTotalUnits } = await req.json()

    const createdDepot = await prisma.depots.create(
        {
            data: {
                warehouse_id: parseInt(warehouseId),
                product_id: parseInt(productId),
                product_total_units: parseInt(productTotalUnits),
                product_total_remaining_units: parseInt(productTotalUnits),
                inserted_by_id: parseInt(insertedById)
            }
        }
    )

    return NextResponse.json(createdDepot)
}

// Add new units to a depot
export async function PUT(req: Request) {
    const { ownerId, depotId, newUnits } = await req.json()

    if (ownerId && depotId) {
        const updatedDeposit = await prisma.depots.update(
            {
                data: { product_total_units: { increment: parseInt(newUnits) }, product_total_remaining_units: { increment: parseInt(newUnits) } },
                where: { id: parseInt(depotId) }
            }
        )

        return NextResponse.json(updatedDeposit)
    }

    return new Response('La acción de agregar productos ha fallado', { status: 500 })
}

// Update new units to a depot
export async function PATCH(req: Request) {
    const { ownerId, depotId, productTotalUnits, productTotalRemainingUnits } = await req.json()

    if (ownerId && depotId) {
        const updatedDeposit = await prisma.depots.update(
            {
                data: { product_total_units: parseInt(productTotalUnits), product_total_remaining_units: parseInt(productTotalRemainingUnits) },
                where: { id: parseInt(depotId) }
            }
        )

        return NextResponse.json(updatedDeposit)
    }

    return new Response('La acción de modificar las cantidades de productos ha fallado', { status: 500 })
}

// Delete warehouse depot
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const depotId = searchParams.get("depotId")

    if (depotId) {
        const deletedDepot = await prisma.depots.delete({ where: { id: parseInt(depotId) } })

        return NextResponse.json(deletedDepot)
    }

    return new Response('La acción de eliminar depósito ha fallado', { status: 500 })
}