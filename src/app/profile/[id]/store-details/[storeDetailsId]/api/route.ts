import { NextResponse } from "next/server"
import { prisma } from "@/db"

//Sirve para abreviar params en las props de las peticiones
interface Params {
    params: { id: string, storeDetailsId: string }
}

//Pido todos los departamentos, productos de estos departamentos
// y sus caracteristicas( todo esto de la tienda seleccionada )
export async function GET(req: Request, { params }: Params) {
    const storeId = parseInt(params.storeDetailsId)
    const result = await prisma.departments.findMany({
        //Elijo los departamentos de los productos de la tienda
        where: {
            products: {
                some: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    AND: [
                                        {
                                            store_id: storeId
                                        },
                                        {
                                            product_units: { not: -1 }
                                        }
                                    ]

                                }
                            }
                        }
                    }
                }
            }
        },
        //Incluyo los productos q tiene la tienda respecto al departamento 
        include: {
            products: {
                where: {
                    depots: {
                        some: {
                            store_depots: {
                                some: {
                                    AND: [
                                        {
                                            store_id: storeId
                                        },
                                        {
                                            product_units: { not: -1 }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                // y en cada producto incluyo los detalles de ese
                //producto
                include: {
                    depots: {
                        include: {
                            store_depots: {
                                where: {
                                    AND: [
                                        {
                                            store_id: storeId
                                        },
                                        {
                                            product_units: { not: -1 }
                                        }
                                    ]
                                },
                                include: {_count: {select: {product_offers: true}}}
                            }
                        }
                    },
                    departments: true,
                    characteristics: true,
                    images: true,
                }
            }
        }

    })
    return NextResponse.json(result)
}

export async function PUT(req: Request) {
    const {
        id,
        store_id,
        depot_id,
        product_units,
        product_remaining_units,
        seller_profit_percentage,
        is_active,
        sell_price,
        sell_price_unit,
        seller_profit_quantity,
        price_discount_percentage,
        price_discount_quantity,
    } = await req.json();

    
    
    const result = await prisma.store_depots.update({
        data: {
            id,
            store_id,
            depot_id,
            product_units,
            product_remaining_units,
            seller_profit_percentage,
            is_active,
            sell_price,
            sell_price_unit,
            seller_profit_quantity,
            price_discount_percentage,
            price_discount_quantity,
        }, where: { id: id }
    })

    return NextResponse.json(result)

}