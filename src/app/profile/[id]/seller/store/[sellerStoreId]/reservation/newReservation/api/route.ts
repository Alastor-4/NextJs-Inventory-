import { NextResponse } from "next/server";
import { prisma } from "@/db";

interface Params {
    params: { id: string, sellerStoreId: string }
}

export async function GET(req: Request, { params }: Params) {
    const storeId = parseInt(params.sellerStoreId)

    const result = await prisma.reservations.findMany({
        where: {
            reservation_products: {
                some: {
                    store_depots: {
                        store_id: storeId
                    }
                }
            }
        },

        include: {
            reservation_products: {
                where: {
                    store_depots: {
                        store_id: storeId
                    }
                },
                include: {
                    store_depots: {
                        include: {
                            depots: {
                                include: {
                                    products: {
                                        include: {
                                            departments: true,
                                            characteristics: true,
                                            images: true
                                        }
                                    }
                                }
                            },
                            product_offers: true
                        }
                    }
                }
            },

            reservation_status: true,
            users: true

        }
    })
    return NextResponse.json(result)
}

export async function PUT(req: Request) {
    const { id, payment_method, requesting_user_id, request_delivery, delivery_notes, status_description, status_id, total_price } = await req.json()

    const data = {
        payment_method,
        requesting_user_id,
        request_delivery,
        delivery_notes,
        status_description,
        status_id,
        total_price
    }

    const result = await prisma.reservations.update({ where: { id: id }, data })

    return NextResponse.json(result)
}
