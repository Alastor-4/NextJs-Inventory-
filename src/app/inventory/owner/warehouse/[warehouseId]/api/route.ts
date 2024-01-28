import { NextResponse } from 'next/server'
import { prisma } from "db";

// GET all depots in warehouse
export async function GET(req: Request, { params }: { params: { warehouseId: string } }) {
    try {
        const { searchParams } = new URL(req.url)
        const ownerId = +searchParams.get("userId")!
        const warehouseId = +params.warehouseId

        if (ownerId && warehouseId) {
            const warehouseDepots = await prisma.departments.findMany({
                where: {
                    products: {
                        some: {
                            depots: {
                                some: { warehouse_id: warehouseId }
                            }
                        }
                    }
                },
                include: {
                    products: {
                        where: {
                            depots: {
                                some: { warehouse_id: warehouseId }
                            }
                        },
                        include:
                        {
                            departments: true,
                            characteristics: true,
                            images: true,
                            depots: {
                                where: { warehouse_id: warehouseId }
                            }
                        }
                    }
                }
            })

            return NextResponse.json(warehouseDepots)
        }
    } catch (error) {
        console.log('[DEPOTS_WAREHOUSE_GET_ALL]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CREATE new warehouse depot
export async function POST(req: Request) {
    try {
        const { warehouseId, productId, insertedById, productTotalUnits } = await req.json()

        const createdDepot = await prisma.depots.create(
            {
                data: {
                    warehouse_id: +warehouseId,
                    product_id: +productId,
                    product_total_units: +productTotalUnits,
                    product_total_remaining_units: +productTotalUnits,
                    // inserted_by_id: insertedById
                }
            }
        )

        return NextResponse.json(createdDepot)
    } catch (error) {
        console.log('[DEPOT_WAREHOUSE_CREATE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// ADD new units to a depot
export async function PUT(req: Request) {
    try {
        const { ownerId, depotId, newUnits } = await req.json()

        if (ownerId && depotId) {
            const updatedDeposit = await prisma.depots.update(
                {
                    data: {
                        product_total_units: { increment: +newUnits },
                        product_total_remaining_units: { increment: +newUnits }
                    },
                    where: { id: +depotId }
                }
            )

            return NextResponse.json(updatedDeposit)
        }
    } catch (error) {
        console.log('[DEPOT_WAREHOUSE_UPDATE_UNITS]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE new units to a depot
export async function PATCH(req: Request) {
    try {
        const { ownerId, depotId, productTotalUnits, productTotalRemainingUnits } = await req.json()

        if (ownerId && depotId) {
            const updatedDeposit = await prisma.depots.update(
                {
                    data: {
                        product_total_units: +productTotalUnits,
                        product_total_remaining_units: +productTotalRemainingUnits
                    },
                    where: { id: +depotId }
                }
            )

            return NextResponse.json(updatedDeposit)
        }
    } catch (error) {
        console.log('[DEPOT_WAREHOUSE_PATCH_UNITS]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE warehouse depot
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const depotId = searchParams.get("depotId");

        const deletedDepot = await prisma.depots.delete({ where: { id: +depotId! } })

        return NextResponse.json(deletedDepot)
    } catch (error) {
        console.log('[DEPOT_WAREHOUSE_DELETE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}