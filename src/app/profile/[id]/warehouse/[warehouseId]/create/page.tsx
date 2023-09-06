import UserWarehouseForm from "@/app/profile/[id]/warehouse/[warehouseId]/components/UserWarehouseForm";
import {prisma} from "db";

export default async function Page({params}) {
    const userId = params.id
    const warehouseId = params.warehouseId
    const departmentProducts = await prisma.departments.findMany(
        {
            where: {
                products: {some: {owner_id: parseInt(userId)}}
            },
            include: {
                products: {include: {departments: true, characteristics: true, images: true}}
            }
        }
    )

    return (
        <main>
            <UserWarehouseForm ownerId={userId} warehouseId={warehouseId} departmentProducts={departmentProducts}/>
        </main>
    )
}