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

// Change reservation status to "Reservado". Quantity of products are reserved too (taken off from store remaining units)
export async function PUT(req: Request) {
    const { storeDepotId, productReservationId } = await req.json()

    if (storeDepotId && productReservationId) {
        const storeDepot = await prisma.store_depots.findUnique({where: {id: parseInt(storeDepotId)}})
        const productReservation = await prisma.products_reservation.findFirst({where: {id: parseInt(productReservationId), store_depot_id: parseInt(storeDepotId)}})
        const newStatus = await prisma.reservation_status.findFirst({where: {code: 3}})

        if (
            storeDepot &&
            storeDepot.is_active &&
            storeDepot.sell_price?.toString() !== "0" &&
            storeDepot.product_remaining_units &&
            productReservation &&
            productReservation.units_quantity <= storeDepot.product_remaining_units &&
            newStatus
        ) {
            const [updatedStoreDepot, updatedReservation] = await prisma.$transaction([
                prisma.store_depots.update(
                    {
                        data: { product_remaining_units: {decrement: productReservation.units_quantity}},
                        where: {id: storeDepot.id}
                    }
                ),

                prisma.products_reservation.update(
                    {
                        data: {status_id: newStatus.id},
                        where: {id: productReservation.id},
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
                        }
                    }
                )
            ])

            return NextResponse.json(updatedReservation)
        }

        return new Response('La acción sobre la reservación ha fallado', {status: 400})
    }

    return new Response('La acción sobre la reservación ha fallado', {status: 500})
}