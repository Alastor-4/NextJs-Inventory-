import {NextResponse} from 'next/server'
import {prisma} from "db";

// Get all stores and a specific depot info
export async function GET(request: Request, {params}: { params: { id: string } }) {
    const {searchParams} = new URL(request.url)

    const ownerId = params.id

    const depotId = searchParams.get("depotId")

    if (ownerId && depotId) {
        const storeDepots = await prisma.stores.findMany(
            {
                where: {
                   owner_id: parseInt(ownerId)
                },
                include: {
                    store_depots: { where: {depot_id: parseInt(depotId)} }
                }
            }
        )

        return NextResponse.json(storeDepots)
    }

    return new Response('La acción de obtener los depósitos ha fallado', {status: 500})
}