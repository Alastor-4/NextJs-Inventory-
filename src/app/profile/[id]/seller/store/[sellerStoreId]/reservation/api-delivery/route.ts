import { NextResponse } from 'next/server'
import {prisma} from "db";

// Change reservation status to "En camino" when requested delivery reservation
export async function PUT(req: Request) {
    const { productReservationId } = await req.json()

    if (productReservationId) {
        const enCaminoStatus = await prisma.reservation_status.findFirst({where: {code: 5}})

        const reservation = await prisma.products_reservation.findUnique(
            {
                where: {id: parseInt(productReservationId)},
                include: {reservation_status: true}
            }
        )
        const reservationStatusCode = reservation?.reservation_status.code

        //check if reservation has request_delivery and "Reservado" status
        if (enCaminoStatus && reservation?.request_delivery && reservationStatusCode === 3) {
            const updatedReservation = await prisma.products_reservation.update(
                {
                    data: {
                        status_id: enCaminoStatus.id,
                        status_description: "En camino a entregar los productos de su reservación"
                    },
                    where: {id: reservation.id},
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
                        reservation_status: true,
                        users: true,
                    }
                }
            )

            return NextResponse.json(updatedReservation)
        }

        return new Response('La acción sobre la reservación ha fallado', {status: 400})
    }

    return new Response('La acción sobre la reservación ha fallado', {status: 500})
}