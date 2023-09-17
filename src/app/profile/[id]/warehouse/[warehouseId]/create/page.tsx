import UserWarehouseForm from "@/app/profile/[id]/warehouse/[warehouseId]/components/UserWarehouseForm";
import {prisma} from "db";

export default async function Page({params}) {
    const userId = params.id
    const warehouseId = params.warehouseId
    const departmentProducts = await prisma.departments.findMany(
        {
            where: {
                AND: [
                    {
                        products: {
                            some: {owner_id: parseInt(userId)}
                        },
                    },
                    {
                        products: {
                            some: {depots: {none: {warehouse_id: parseInt(warehouseId)}}}
                        },
                    },
                ]
            },
            include: {
                products: {
                    where: {depots: {none: {warehouse_id: parseInt(warehouseId)}}},
                    include: {departments: true, characteristics: true, images: true},
                }
            }
        }
    )

    return (
        <main>
            <UserWarehouseForm ownerId={userId} warehouseId={warehouseId} departmentProducts={departmentProducts}/>
        </main>
    )
}