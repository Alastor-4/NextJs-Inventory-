import { prisma } from "@/db"
import { NextResponse } from "next/server"

interface Params {
    params: { sellerStoreId: string }
}

export async function GET(req: Request, { params }: Params) {
    const storeId = +params.sellerStoreId
    const result = await prisma.product_store_transfers.findMany({
        where: {
            store_depots: {
                store_id: storeId
            }
        },
        include: {
            stores: true,
            store_depots: {
                include: {
                    depots: {
                        include: {
                            products: {
                                include: {
                                    characteristics: true,
                                    images: true,
                                    departments: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    return NextResponse.json(result)
}