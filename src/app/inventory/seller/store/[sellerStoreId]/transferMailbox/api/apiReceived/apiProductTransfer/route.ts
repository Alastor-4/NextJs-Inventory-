import { NextResponse } from "next/server";
import { prisma } from "@/db";

interface Params {
    params: { sellerStoreId: string }
}

export async function GET(req: Request, { params }: Params) {
    const storeId = parseInt(params.sellerStoreId)

    const result = await prisma.product_store_transfers.findMany({
        where: {
            to_store_id: storeId
        },
        include: {
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
                    },
                    stores: true,
                    product_offers: true,
                }
            }
        }
    })

    return NextResponse.json(result)
}

export async function PUT(req: Request) {
    const { id, from_store_accepted, to_store_accepted, transfer_cancelled } = await req.json()

    const data = {
        from_store_accepted,
        to_store_accepted,
        transfer_cancelled
    }

    const result = await prisma.product_store_transfers.update({ data, where: { id: id } })

    return NextResponse.json(result)
}