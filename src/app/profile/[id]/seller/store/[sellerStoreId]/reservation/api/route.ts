import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get store active reservations ['Pendiente', 'Reservado', 'En camino']
export async function GET(request: Request, { params }: { params: { sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const storeReservations = await prisma.products_reservation.findMany({
        where: {
            reservation_status: {code: {in: [1, 3, 5]}},
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
            reservation_status: true,
            users: true,
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
                        data: {
                            status_id: newStatus.id,
                            status_description: "Producto reservado en la tienda"
                        },
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
                            reservation_status: true,
                            users: true,
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

// Change reservation status to "Cancelado"
export async function PATCH(req: Request) {
    const { productReservationId } = await req.json()

    if (productReservationId) {
        const canceledStatus = await prisma.reservation_status.findFirst({where: {code: 2}})

        const reservation = await prisma.products_reservation.findUnique(
            {
                where: {id: parseInt(productReservationId)},
                include: {reservation_status: true}
            }
        )
        const reservationStatusCode = reservation?.reservation_status.code

        if (canceledStatus && reservationStatusCode) {
            //when reservation has status "Reservado" or "En camanino" restore previouslly reseved items
            if (reservationStatusCode === 3 || reservationStatusCode === 5) {
                await prisma.store_depots.update({
                    data: {product_remaining_units: {increment: reservation.units_quantity}},
                    where: {id: reservation.store_depot_id}})
            }

            const updatedReservation = await prisma.products_reservation.update(
                {
                    data: {
                        status_id: canceledStatus.id,
                        status_description: "Reservación cancelada por la tienda"
                    },
                    where: {id: parseInt(productReservationId)},
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

// Change reservation status to "En camino" when requested delivery reservation
export async function POST(req: Request) {
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
                    where: {id: parseInt(productReservationId)},
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