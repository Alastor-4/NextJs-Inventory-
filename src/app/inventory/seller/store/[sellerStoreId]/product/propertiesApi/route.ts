import { NextResponse } from "next/server";
import { prisma } from "db";

interface Params {
    params: { storeDepotId: string, propertyId: string }
}

// create a property for a store_depot
export async function POST(req: Request, { params }: Params) {
    const { searchParams } = new URL(req.url);
    const storeDepotId = parseInt(searchParams.get("storeDepotId")!)

    const body = await req.json()
    const {name, value} = body

    const newProperty = await prisma.store_depot_properties.create({
        data: {
            store_depot_id: storeDepotId,
            name: name,
            value: value,
        }
    })

    return NextResponse.json(newProperty)
}

// disable/enable a property for a store_depot
export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const propertyId = parseInt(searchParams.get("propertyId")!)

    const body = await req.json()
    const {isActive} = body

    const newProperty = await prisma.store_depot_properties.update({
        data: {is_active: isActive},
        where: {
            id: propertyId,
        }
    })

    return NextResponse.json(newProperty)
}

// delete a property for a store_depot
export async function DELETE(req: Request, { params }: Params) {
    const propertyId = parseInt(<string>params.propertyId)

    const deletedProperty = await prisma.store_depot_properties.delete({
        where: {
            id: propertyId,
        }
    })

    return NextResponse.json(deletedProperty)
}