import { NextResponse } from "next/server"
import { prisma } from "db"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)

    const storeId = parseInt(<string>searchParams.get("storeId"))
    const warehouseId = parseInt(<string>searchParams.get("warehouseId"))

    const result = await prisma.departments.findMany({
        where: {
            products: {
                some: {
                    depots: {
                        some: {
                            AND: [{

                                warehouse_id: warehouseId
                            },
                            {
                                OR: [{
                                    NOT:{
                                        store_depots: {
                                            some: {
                                                store_id: storeId 
                                            }
                                        }
                                    }
                                    
                                }, {
                                    NOT: {
                                        store_depots: {
                                            some: {}
                                        }
                                    }

                                }
                                ]
                            }
                            ]
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
                            AND: [{

                                warehouse_id: warehouseId
                            },
                            {
                                OR: [{
                                    store_depots: {
                                        some: {
                                            store_id: { not: storeId }
                                        }
                                    }
                                }, {
                                    NOT: {
                                        store_depots: {
                                            some: {}
                                        }
                                    }

                                }
                                ]
                            }
                            ]

                        }
                    }

                },
                include: {
                    departments: true,
                    depots: true
                }
            }
        }

    })
    return NextResponse.json(result);

}

export async function POST(req: Request) {
    const { storeId, depotId, productUnits, productRemainingUnits, sellerProfitPercentage } = await req.json();
    
    const result = await prisma.store_depots.create({
        data: {
            store_id: storeId,
            depot_id: depotId,
            product_units: productUnits,
            product_remaining_units: productRemainingUnits,
            seller_profit_percentage: sellerProfitPercentage
        }
    })
    return NextResponse.json(result);
}