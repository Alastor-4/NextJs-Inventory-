import { NextResponse } from 'next/server'
import logger from '@/utils/logger';
import { prisma } from "db";

// GET store products sells
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const storeId = +searchParams.get("storeId")!;
    const allSells = searchParams.get("loadAllSells");
    const todayStart = searchParams.get("todayStart");
    const todayEnd = searchParams.get("todayEnd");

    if (storeId && (allSells === 'true')) {
        const storeAllSells = await prisma.sells.findMany(
            {
                where: {
                    OR: [
                        { sell_products: { some: { store_depots: { store_id: storeId } } } },
                        { reservations: { reservation_products: { some: { store_depots: { store_id: storeId } } } } }
                    ]
                },
                include: {
                    sell_payment_methods: true,
                    sell_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { product_offers: true, depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
                    reservations: {
                        where: { reservation_products: { some: { store_depots: { store_id: storeId } } } },
                        include: { reservation_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { product_offers: true, depots: { include: { products: { include: { departments: true } } } } } } }, }, },
                    }
                }
            }
        )
        return NextResponse.json(storeAllSells);
    } else if (storeId) {
        const storeTodaySells = await prisma.sells.findMany(
            {
                where: {
                    created_at: {
                        gte: new Date(todayStart!),
                        lt: new Date(todayEnd!),
                    },
                    OR: [
                        { sell_products: { some: { store_depots: { store_id: storeId } } } },
                        { reservations: { reservation_products: { some: { store_depots: { store_id: storeId } } } } }
                    ]
                },
                include: {
                    sell_payment_methods: true,
                    sell_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { product_offers: true, depots: { include: { products: { include: { departments: true } }, warehouses: true } } } } } },
                    reservations: {
                        where: { reservation_products: { some: { store_depots: { store_id: storeId } } } },
                        include: { reservation_products: { where: { store_depots: { store_id: storeId } }, include: { store_depots: { include: { product_offers: true, depots: { include: { products: { include: { departments: true } } } } } } }, }, },
                    }
                }
            }
        )
        return NextResponse.json(storeTodaySells);
    }

    logger.info(`Hay datos undefined que impiden pedir los datos a la bd, en la obtencion de las ventas de los productos en la tienda`)

    return new Response('La acción de obtener los datos de la tienda ha fallado', { status: 500 })
}

//ADD returned quantity, reason and date
export async function PUT(req: Request) {
    const { sell_product_id, returned_quantity, returned_reason, sell_payment_methods } = await req.json();

    const price = await prisma.sell_products.findUnique({ where: { id: sell_product_id }, include: { store_depots: true } });

    const updatedSellProducts = await prisma.sell_products.update({
        where: { id: +sell_product_id! },
        data: {
            returned_reason: returned_reason,
            units_returned_quantity: { increment: returned_quantity },
            units_quantity: { decrement: returned_quantity },
            returned_at: new Date(),
            store_depots: { update: { product_remaining_units: { increment: returned_quantity } } },
            price: { decrement: (returned_quantity * +price?.store_depots?.sell_price!) },
            sells: {
                update: {
                    total_price: { decrement: (returned_quantity * +price?.store_depots?.sell_price!) },
                }
            }
        }, include: { sells: { include: { sell_payment_methods: true } } }
    });

    try {
        for (const method of updatedSellProducts.sells.sell_payment_methods) {
            await prisma.sell_payment_methods.update({
                where: { id: method.id }, data: { quantity: { decrement: sell_payment_methods.filter(({ paymentMethod }: any) => paymentMethod === method.payment_method)[0].quantity! ?? 0 } }
            });
        }
    } catch (error) {
        console.log(error);
    }

    updatedSellProducts.sells.sell_payment_methods

    return new NextResponse('Se ha realizado la devolución con éxito', { status: 200 })
}