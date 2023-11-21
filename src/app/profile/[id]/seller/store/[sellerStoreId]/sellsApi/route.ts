import { NextResponse } from 'next/server'
import {prisma} from "db";
import dayjs from "dayjs";

// Get today store product sells
export async function GET(req: Request, { params }: { params: { id: string, sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const todayStart = dayjs().set("h", 0).set("m", 0).set("s", 0)
    const todayEnd = todayStart.add(1, "day")

    const store = await prisma.sells.findMany(
        {
            where: {
                created_at: {
                    gte: new Date(todayStart.format("YYYY-MM-DD")),
                    lt: new Date(todayEnd.format("YYYY-MM-DD")),
                },

                OR: [
                    {
                        sell_products: {
                            some: {
                                store_depots: {store_id: storeId}
                            }
                        }
                    },
                    {
                        reservations: {
                            reservation_products: {some: {store_depots: {store_id: storeId}}}
                        }
                    }
                ]
            },
            include: {
                sell_products: {where: {store_depots: {store_id: storeId}}, include: {store_depots: true}},
                reservations: {
                    where: {reservation_products: {some: {store_depots: {store_id: storeId}}}},
                    include: {
                        reservation_products: {
                            where: {store_depots: {store_id: storeId}},
                            include: {store_depots: true},
                        },
                    },
                }
            }
        }
    )

    return NextResponse.json(store)
}