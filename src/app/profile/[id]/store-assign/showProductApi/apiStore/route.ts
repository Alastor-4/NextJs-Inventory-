import { NextResponse } from "next/server";
import { prisma } from 'db'

export async function GET(req) {

    const { searchParams } = new URL(req.url);
    const storeId = parseInt(searchParams.get("storeId"));

    const result = await prisma.departments.findMany({
        where: {
            products: {
                some: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    store_id: storeId
                                }
                            }
                        }
                    }
                }
            }
        },
        include: {
            products: {
                where: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    store_id: storeId
                                }
                            }
                        }
                    }
                },
                include: {
                    departments: true,
                    depots: {
                        include: {
                            store_depots: true
                        }
                    }
                }
            }
        }
    })
    return NextResponse.json(result)
}
export async function PUT(req) {
    const { id, store_id, depot_id, product_units, product_remaining_units } = await req.json();
    const data = {
        store_id: store_id,
        depot_id: depot_id,
        product_units: product_units,
        product_remaining_units: product_remaining_units
    }
    const result = await prisma.store_depots.update({ data, where: { id: id } })
    return NextResponse.json(data)
}
export async function DELETE(req) {
    const { searchParams } = new URL(req.url)
    const storeDepotId = parseInt(searchParams.get("storeDepotId"))

    const result = await prisma.store_depots.delete({ where: { id: storeDepotId } })

    return NextResponse.json(result);
}