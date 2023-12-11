import { NextResponse } from "next/server";
import { prisma } from "@/db";

export async function GET(req: any) {
    const { searchParams } = new URL(req.url)
    const storeDepotId = await parseInt(<string>(searchParams.get('storeDepotId')))

    const result = await prisma.product_offers.findMany({
        where: {
            store_depot_id: storeDepotId
        }
    })
    return NextResponse.json(result);
}

export async function POST(req: any) {
    const { compare_units_quantity, compare_function, price_per_unit, store_depot_id } = await req.json()
    const data = {
        compare_units_quantity,
        compare_function,
        price_per_unit,
        store_depot_id
    }
    const result = await prisma.product_offers.create({ data })

    return NextResponse.json(result);
}

export async function PUT(req: any) {
    const { id, compare_units_quantity, compare_function, price_per_unit, store_depot_id } = await req.json()
    const data = {
        id: id,
        compare_units_quantity,
        compare_function,
        price_per_unit,
        store_depot_id
    }
    const result = await prisma.product_offers.update({ where: { id: id }, data })

    return NextResponse.json(result);
}

export async function PATCH(req: any) {
    const {productOfferId} = await req.json()

    const offer = await prisma.product_offers.findUnique({where: {id: productOfferId}})

    if (offer) {
        const result = await prisma.product_offers.update(
            {data: {is_active: !offer.is_active}, where: { id: offer.id }}
        )

        return NextResponse.json(result);
    }

    return new Response('La acción de modificar oferta ha fallado', {status: 400})
}

export async function DELETE(req: any) {
    const { searchParams } = new URL(req.url)
    const productOfferId = parseInt(<string>(searchParams.get('productOfferId')))

    const result = await prisma.product_offers.delete({ where: { id: productOfferId } })

    return NextResponse.json(result);
}