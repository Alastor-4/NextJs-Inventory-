import { NextResponse } from "next/server";
import { prisma } from "@/db";
import {product_offers} from "@prisma/client";

interface Params {
    params: { sellerStoreId: string }
}

//return offer price per unit from first applicable offer found. return false if no applicable offer found
function evaluateOffers(offerItems: product_offers[], itemsQuantity: number): number | false {
    const evaluate = (compareFunction: string, compareQuantity: number, itemsQuantity: number): boolean => {
        switch (compareFunction) {
            case "=":
                return itemsQuantity === compareQuantity

            case ">":
                return itemsQuantity > compareQuantity

            default:
                return false
        }
    }

    const foundApplicableOfferIndex = offerItems.findIndex(item => item.is_active && evaluate(item.compare_function, item.compare_units_quantity, itemsQuantity))

    if (foundApplicableOfferIndex > -1)
        return offerItems[foundApplicableOfferIndex].price_per_unit

    return false
}

//compute price per unit using offers (if exist and apply some) and discount if exist
function computeDepotPricePerUnit(storeDepotWithOffersRelation: any, unitsQuantity: number): number {
    const productOffers = storeDepotWithOffersRelation.product_offers
    const productHasOffers = !!productOffers.length

    const offersEvaluation = productHasOffers
        ? evaluateOffers(productOffers, unitsQuantity)
        : false

    //final price method: If product has offers and unitsQuantity apply to one of them, final price is taken from
    //fulfilled offer. If no applicable offer exist then final price es taken from product base price and discount if it exists
    return offersEvaluation
        ? offersEvaluation
        : storeDepotWithOffersRelation.price_discount_quantity
            ? storeDepotWithOffersRelation.sell_price - storeDepotWithOffersRelation.price_discount_quantity
            : storeDepotWithOffersRelation.price_discount_percentage
                ? storeDepotWithOffersRelation.sell_price - (storeDepotWithOffersRelation.price_discount_percentage * storeDepotWithOffersRelation.sell_price / 100)
                : storeDepotWithOffersRelation.sell_price
}

export async function GET(req: Request, { params }: Params) {
    const storeId = parseInt(params.sellerStoreId)

    const result = await prisma.product_store_transfers.findMany({
        where: {
            to_store_id: storeId
        },
        include: {
            store_depots: {
                include: {
                    depots: {
                        include: {
                            products: {
                                include: {
                                    characteristics: true,
                                    images: true,
                                    departments: true
                                }
                            }
                        }
                    },
                    stores: true,
                    product_offers: true,
                }
            }
        }
    })

    return NextResponse.json(result)
}

//handle accept transfer
export async function POST(req: Request) {
    const { productStoreTransferId } = await req.json()

    const storeTransferItem = await prisma.product_store_transfers.findUniqueOrThrow(
        {
            where: { id: parseInt(productStoreTransferId) },
            include: {
                store_depots: {
                    include: {
                        depots: {include: {products: true}},
                        product_offers: true,
                        store_depot_properties: true
                    }
                }
            }
        }
    )

    if (!storeTransferItem.to_store_accepted && !storeTransferItem.transfer_cancelled) {
        const depotId = storeTransferItem.store_depots!.depots!.id
        const productId = storeTransferItem.store_depots!.depots!.products!.id

        //search if exists a depot for same product in destination store
        const depotInDestinationStore = await prisma.store_depots.findFirst(
            {
                where: {
                    store_id: storeTransferItem.to_store_id,
                    depots: {products: {id: productId}}
                }
            }
        )

        if (depotInDestinationStore) {
            //when depot exist only modify with transferred units in it
            const [res1, res2] = await prisma.$transaction([
                prisma.store_depots.update(
                    {
                        data: {
                            product_remaining_units: {// @ts-ignore
                                increment: depotInDestinationStore.product_remaining_units === -1
                                    ? storeTransferItem.units_transferred_quantity! + 1
                                    : storeTransferItem.units_transferred_quantity
                            },
                            product_units: {increment: storeTransferItem.units_transferred_quantity!}
                        },
                        where: {id: depotInDestinationStore.id}
                    }
                ),

                prisma.product_store_transfers.update({ data: { to_store_accepted: true }, where: { id: storeTransferItem.id } })
            ])

            return NextResponse.json(res2)
        } else {
            //when depot does not exist create it with same properties in origen store
            const [res1, res2] = await prisma.$transaction([
                prisma.store_depots.create(
                    {
                        data: {
                            store_id: storeTransferItem.to_store_id,
                            depot_id: depotId,
                            product_units: storeTransferItem.units_transferred_quantity,
                            product_remaining_units: storeTransferItem.units_transferred_quantity,
                            sell_price: storeTransferItem.store_depots!.sell_price,
                            sell_price_unit: storeTransferItem.store_depots!.sell_price_unit,
                            seller_profit_quantity: storeTransferItem.store_depots!.seller_profit_quantity,
                            seller_profit_percentage: storeTransferItem.store_depots!.seller_profit_percentage,
                            seller_profit_unit: storeTransferItem.store_depots!.seller_profit_unit,
                            price_discount_percentage: storeTransferItem.store_depots!.price_discount_percentage,
                            price_discount_quantity: storeTransferItem.store_depots!.price_discount_quantity,
                            discount_description: storeTransferItem.store_depots!.discount_description,
                            product_offers: {createMany: {data: storeTransferItem.store_depots!.product_offers}},
                            store_depot_properties: {createMany: {data: storeTransferItem.store_depots!.store_depot_properties}}
                        }
                    }
                ),

                prisma.product_store_transfers.update({ data: { to_store_accepted: true }, where: { id: storeTransferItem.id } })
            ])

            return NextResponse.json(res2)
        }
    } else {
        return new Response("Ya se ha tomado alguna acción sobre la transferencia proporcionada", {status: 400})
    }
}

//handle accept and sell transfer
export async function PATCH(req: Request) {
    const { productStoreTransferId, sellUnitsQuantity, paymentMethod } = await req.json()

    const parsedSellUnitsQuantity = parseInt(sellUnitsQuantity)

    const storeTransferItem = await prisma.product_store_transfers.findUniqueOrThrow(
        {
            where: { id: parseInt(productStoreTransferId) },
            include: {
                store_depots: {
                    include: {
                        depots: {include: {products: true}},
                        product_offers: true,
                        store_depot_properties: true
                    }
                }
            }
        }
    )

    if (storeTransferItem.units_transferred_quantity! >= parsedSellUnitsQuantity) {
        if (!storeTransferItem.to_store_accepted && !storeTransferItem.transfer_cancelled) {
            const depotId = storeTransferItem.store_depots!.depots!.id
            const productId = storeTransferItem.store_depots!.depots!.products!.id

            //search if exists a depot for same product in destination store
            const depotInDestinationStore = await prisma.store_depots.findFirst(
                {
                    where: {
                        store_id: storeTransferItem.to_store_id,
                        depots: {products: {id: productId}},
                    },
                    include: {product_offers: true}
                }
            )

            if (depotInDestinationStore) {
                //when depot exist only modify with transferred units in it

                const totalPrice = computeDepotPricePerUnit(depotInDestinationStore, sellUnitsQuantity) * sellUnitsQuantity

                const [res1, res2, res3] = await prisma.$transaction([
                    prisma.store_depots.update(
                        {
                            where: {id: depotInDestinationStore.id},
                            data: {
                                product_remaining_units: {// @ts-ignore
                                    increment: depotInDestinationStore.product_remaining_units === -1
                                        ? storeTransferItem.units_transferred_quantity! + 1 - parsedSellUnitsQuantity
                                        : storeTransferItem.units_transferred_quantity! - parsedSellUnitsQuantity
                                },
                                product_units: {increment: storeTransferItem.units_transferred_quantity!},
                            },
                        }
                    ),

                    //use price, discount and offers data from store_depot in destination store
                    prisma.sells.create({
                        data: {
                            total_price: totalPrice,
                            payment_method: paymentMethod,
                            sell_products: {
                                create: {
                                    store_depot_id: depotInDestinationStore.id,
                                    price: depotInDestinationStore.sell_price!.toNumber(),
                                    units_quantity: parsedSellUnitsQuantity,
                                }
                            }
                        }
                    }),

                    prisma.product_store_transfers.update({ data: { to_store_accepted: true }, where: { id: storeTransferItem.id } })
                ])

                return NextResponse.json(res3)
            } else {
                //when depot does not exist create it with same properties in origen store
                const newOffers = storeTransferItem.store_depots!.product_offers.map(item => (
                    {
                        compare_units_quantity: item.compare_units_quantity,
                        compare_function: item.compare_function,
                        price_per_unit: item.price_per_unit,
                        is_active: item.is_active,
                    })
                )

                const newProperties = storeTransferItem.store_depots!.store_depot_properties.map(item => (
                    {
                        name: item.name,
                        value: item.value,
                        is_active: item.is_active,
                    })
                )

                const newStoreDepot = await prisma.store_depots.create(
                    {
                        data: {
                            store_id: storeTransferItem.to_store_id,
                            depot_id: depotId,
                            product_units: storeTransferItem.units_transferred_quantity,
                            product_remaining_units: storeTransferItem.units_transferred_quantity,
                            sell_price: storeTransferItem.store_depots!.sell_price,
                            sell_price_unit: storeTransferItem.store_depots!.sell_price_unit,
                            seller_profit_quantity: storeTransferItem.store_depots!.seller_profit_quantity,
                            seller_profit_percentage: storeTransferItem.store_depots!.seller_profit_percentage,
                            seller_profit_unit: storeTransferItem.store_depots!.seller_profit_unit,
                            price_discount_percentage: storeTransferItem.store_depots!.price_discount_percentage,
                            price_discount_quantity: storeTransferItem.store_depots!.price_discount_quantity,
                            discount_description: storeTransferItem.store_depots!.discount_description,
                            product_offers: {createMany: {data: newOffers}},
                            store_depot_properties: {createMany: {data: newProperties}},
                        },
                        include: {product_offers: true}
                    }
                )

                const totalPrice = computeDepotPricePerUnit(newStoreDepot, sellUnitsQuantity) * sellUnitsQuantity

                const [res1, res2] = await prisma.$transaction([
                    //use price, discount and offers data from store_depot in origen store
                    prisma.sells.create({
                        data: {
                            total_price: totalPrice,
                            payment_method: paymentMethod,
                            sell_products: {
                                create: {
                                    store_depot_id: newStoreDepot.id,
                                    price: newStoreDepot.sell_price!.toNumber(),
                                    units_quantity: parsedSellUnitsQuantity,
                                }
                            }
                        }
                    }),

                    prisma.product_store_transfers.update({ data: { to_store_accepted: true }, where: { id: storeTransferItem.id } })
                ])

                return NextResponse.json(res2)
            }
        } else {
            return new Response("Ya se ha tomado alguna acción sobre la transferencia proporcionada", {status: 400})
        }
    } else {
        return new Response("Los datos proporcionados no son correctos", {status: 400})
    }
}

//handle cancel transfer
export async function PUT(req: Request) {
    const { productStoreTransferId } = await req.json()

    const storeTransferItem = await prisma.product_store_transfers.findUniqueOrThrow(
        {
            where: { id: parseInt(productStoreTransferId) },
            include: {
                store_depots: true
            }
        }
    )

    if (!storeTransferItem.to_store_accepted && !storeTransferItem.transfer_cancelled) {
        const [res1, res2] = await prisma.$transaction([
            //restore transferred units to origin store
            prisma.store_depots.update({
                data: {
                    product_remaining_units: {
                        increment: storeTransferItem.store_depots!.product_remaining_units === -1
                            ? storeTransferItem.units_transferred_quantity! + 1
                            : storeTransferItem.units_transferred_quantity!
                    }
                },
                where: {id: storeTransferItem.store_depot_id!}
            }),

            prisma.product_store_transfers.update({ data: { transfer_cancelled: true }, where: { id: storeTransferItem.id } })
        ])

        return NextResponse.json(res2)
    } else {
        return new Response("Ya se ha tomado alguna acción sobre la transferencia proporcionada", {status: 400})
    }
}