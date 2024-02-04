import { NextResponse } from "next/server";
import { prisma } from "@/db";

interface Params {
    params: { sellerStoreId: string }
}

export async function GET(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url)
    const userId = +<string>searchParams.get('userId')

    const storeId = +params.sellerStoreId

    const result = await prisma.stores.findMany({
        where: {
            NOT: [
                {
                    id: storeId
                }
            ],
            owner_id: userId
        }
    })
    return NextResponse.json(result)
}