import { NextResponse } from 'next/server';
import { prisma } from "db";

// GET warehouse details
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const warehouseId = searchParams.get("warehouseId");

        const warehouse = await prisma.warehouses.findUnique({ where: { id: +warehouseId! }, include: { users: true } })

        return NextResponse.json(warehouse);
    } catch (error) {
        console.log('[USER_GET_ONE_BY_ID]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// UPDATE warehouse
export async function PATCH(req: Request) {
    try {
        const { warehouseId, ownerId, name, description, address } = await req.json()

        const updatedWarehouse = await prisma.warehouses.update({
            data: { owner_id: ownerId, name, description, address },
            where: { id: +warehouseId! }
        })

        return NextResponse.json(updatedWarehouse);
    } catch (error) {
        console.log('[USER_UPDATE_ROLE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}