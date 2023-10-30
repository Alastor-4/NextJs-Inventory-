import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get store active reservations ['Pendiente', 'Reservado']
export async function GET(request: Request, { params }: { params: { sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const storeReservations = await prisma.products_reservation.findMany({
        where: {
            reservation_status: {code: {in: [1, 3]}},
            store_depots: {
                store_id: storeId
            },
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
                                    images: true,
                                },
                            }
                        }
                    }
                }
            },
            reservation_messages: true,
            reservation_status: true,
        },
    })

    return NextResponse.json(storeReservations)
}