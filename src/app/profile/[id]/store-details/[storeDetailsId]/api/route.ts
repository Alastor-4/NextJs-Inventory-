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
                                    store_id: storeId
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
                                    store_id: storeId
                                }
                            }
                        }
                    }
                },
                // y en cada producto incluyo los detalles de ese
                //producto
                include: {
                    depots: {
                        select: {
                            store_depots: {
                                where: {
                                    store_id: storeId
                                }
                            }
                        }
                    },
                    departments: true,
                }
            }
        }

    })
    return NextResponse.json(result)
}