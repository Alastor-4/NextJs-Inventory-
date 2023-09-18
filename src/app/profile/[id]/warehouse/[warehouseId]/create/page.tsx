import UserWarehouseForm from "@/app/profile/[id]/warehouse/[warehouseId]/components/UserWarehouseForm";

export default async function Page({params}) {
    const userId = params.id
    const warehouseId = params.warehouseId

    return (
        <main>
            <UserWarehouseForm ownerId={userId} warehouseId={warehouseId}/>
        </main>
    )
}