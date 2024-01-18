import { NextResponse } from "next/server";
import { prisma } from "@/db";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";

dayjs.extend(utc);

interface Params {
    params: { sellerStoreId: string }
}


export async function GET(req: Request, { params }: Params) {
    const storeId = parseInt(<string>params.sellerStoreId)

    const todayStart = dayjs.utc().set("h", 0).set("m", 0).set("s", 0);
    const todayEnd = todayStart.add(1, "day");

    try {
        const p1 = prisma.store_depot_transfers.findMany({
            where: {
                created_at: {
                    gte: new Date(todayStart.format("YYYY-MM-DD")),
                    lt: new Date(todayEnd.format("YYYY-MM-DD")),
                },
                store_depots: {
                    store_id: storeId
                }
            },
        })

        const p2 = prisma.product_store_transfers.findMany({
            where: {
                created_at: {
                    gte: new Date(todayStart.format("YYYY-MM-DD")),
                    lt: new Date(todayEnd.format("YYYY-MM-DD")),
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