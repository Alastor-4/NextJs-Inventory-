import { NextResponse } from 'next/server'
import {prisma} from "db";

// Get departments having user products
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id

    const departments = await prisma.departments.findMany({where: {products: {some: {owner_id: parseInt(userId)} }}, include: {products: true}})

    return NextResponse.json(departments)
}
