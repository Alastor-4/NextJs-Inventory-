import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get store products
export async function GET(request: Request, { params }: { params: { sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const storeProducts = await prisma.departments.findMany({
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
                    },
                    characteristics: true,
                    images: true,
                },
            },
        },
    })

    return NextResponse.json(storeProducts)
}

