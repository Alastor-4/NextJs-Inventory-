import { NextResponse } from "next/server";
import { prisma } from "@/db";

interface Params {
    params: { sellerStoreId: string }
}

// today transfer stats info
export async function GET(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url);
    const storeId = parseInt(<string>params.sellerStoreId)

    const todayStart = searchParams.get("todayStart");
    const todayEnd = searchParams.get("todayEnd");

    try {
        const p1 = prisma.store_depot_transfers.findMany({
            where: {
                created_at: {
                    gte: new Date(todayStart!),
                    lt: new Date(todayEnd!),
                },
                store_depots: {
                    store_id: storeId
                }
            },
        })

        const p2 = prisma.product_store_transfers.findMany({
            where: {
                created_at: {
                    gte: new Date(todayStart!),
                    lt: new Date(todayEnd!),
                },
                OR: [
                    {
                        store_depots: {
                            store_id: storeId
                        }
                    },
                    {
                        to_store_id: storeId
                    }
                ]
            },
        })

        const [resultWarehouseAndStore, resultStore] = await Promise.all([p1, p2])

        return NextResponse.json({
            warehouseAndStore: resultWarehouseAndStore,
            store: resultStore
        })

    } catch (e) {
        return new Response("Error al obtener las transferencias de hoy", { status: 400 })
    }
}

// today transfers details. using POST here instead of GET to avoid create a new route file
export async function POST(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url);
    const storeId = parseInt(<string>params.sellerStoreId)

    const todayStart = searchParams.get("todayStart");
    const todayEnd = searchParams.get("todayEnd");

    try {
        const p1 = prisma.store_depot_transfers.findMany({
            where: {
                created_at: {
                    gte: new Date(todayStart!),
                    lt: new Date(todayEnd!),
                },
                store_depots: { store_id: storeId }
            },
            include: {
                store_depots: {
                    include: {
                        depots: {
                            include: {
                                warehouses: true,
                                products: {
                                    include: {
                                        departments: true,
                                        characteristics: true,
                                        images: true
                                    }
                                }
                            }
                        }
                    }
                },
                created_by_user: true,
            }
        })

        const p2 = prisma.product_store_transfers.findMany({
            where: {
                created_at: {
                    gte: new Date(todayStart!),
                    lt: new Date(todayEnd!),
                },
                OR: [
                    { store_depots: { store_id: storeId }},
                    { to_store_id: storeId }
                ]
            },
            include: {
                store_depots: {
                    include: {
                        depots: {
                            include: {
                                warehouses: true,
                                products: {
                                    include: {
                                        departments: true,
                                        characteristics: true,
                                        images: true
                                    }
                                }
                            }
                        }
                    }
                },
                stores: true
            }
        })

        const [resultWarehouseAndStore, resultStore] = await Promise.all([p1, p2])

        return NextResponse.json({
            warehouseAndStore: resultWarehouseAndStore,
            store: resultStore
        })

    } catch (e) {
        return new Response("Error al obtener las transferencias de hoy", { status: 400 })
    }
}