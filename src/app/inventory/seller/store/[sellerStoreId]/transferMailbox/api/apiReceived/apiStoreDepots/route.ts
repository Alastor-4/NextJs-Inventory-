import { NextResponse } from "next/server"
import { prisma } from "@/db"

interface Params {
    params: { sellerStoreId: string }
}

export async function GET(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url)

    const productId = parseInt(<string>searchParams.get('productId'))
    const storeId = parseInt(params.sellerStoreId)

    const result = await prisma.store_depots.findFirst({
        where: {
            AND: [
                {
                    depots: {
                        products: {
                            id: productId
                        }
                    }
                },
                { store_id: storeId }
            ]
        },
        include: {
            product_offers: true
        }
    })

    return NextResponse.json(result)
}