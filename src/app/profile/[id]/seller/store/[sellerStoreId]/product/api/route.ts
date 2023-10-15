import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get store products
export async function GET(request: Request, { params }: { params: { sellerStoreId: string } }) {
    const storeId = parseInt(params.sellerStoreId)

    const storeProducts = await prisma.departments.findMany({
        where: {
            products: {
                some: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    store_id: storeId
                                }
                            }
                        }
                    }
                }
            }
        },
        include: {
            products: {
                where: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    store_id: storeId
                                }
                            }
                        }
                    }
                },
                include: {
                    departments: true,
                    depots: {
                        include: {
                            store_depots: true
                        }
                    },
                    characteristics: true,
                    images: true,
                },
            },
        },
    })

    return NextResponse.json(storeProducts)
}

// Toggle store depot isActive
export async function PUT(req, res) {
    const { storeDepotId } = await req.json()

    if (storeDepotId) {
        const storeDepot = await prisma.store_depots.findUnique({where: {id: parseInt(storeDepotId)}})
        const updatedDepot = await prisma.store_depots.update({data: {is_active: !storeDepot.is_active}, where: {id: storeDepot.id}})

        return NextResponse.json(updatedDepot)
    }

    res.status(500).json({ message: "La acción de modificar isActive ha fallado" })
}

