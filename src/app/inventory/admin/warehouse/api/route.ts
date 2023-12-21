import { NextResponse } from 'next/server'
import { prisma } from "db";

// GET all user warehouses
export async function GET(req: Request) {
    try {
        const warehouses = await prisma.warehouses.findMany({ include: { users: true } });

        return NextResponse.json(warehouses);
    } catch (error) {
        console.log('[WAREHOUSE_GET_ALL]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// CREATE new user warehouse
export async function POST(req: Request) {
    try {
        const { name, description, address, ownerId } = await req.json();

        const newWarehouse = await prisma.warehouses.create({
            data: { name, description, address, owner_id: ownerId }
        })

        return NextResponse.json(newWarehouse);
    } catch (error) {
        console.log('[WAREHOUSE_CREATE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE user warehouse
export async function PUT(req: Request) {
    try {
        const { warehouseId, name, description, address } = await req.json();

        const updatedWarehouse = await prisma.warehouses.update({
            data: { name, description, address },
            where: { id: warehouseId }
        });

        return NextResponse.json(updatedWarehouse);
    } catch (error) {
        console.log('[WAREHOUSE_UPDATE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// DELETE user warehouse
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const warehouseId = searchParams.get("warehouseId");

        const deletedWarehouse = await prisma.warehouses.delete({ where: { id: +warehouseId! } })

        return NextResponse.json(deletedWarehouse);
    } catch (error) {
        console.log('[WAREHOUSE_DELETE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}