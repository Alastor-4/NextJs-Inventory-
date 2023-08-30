import UserWarehouseMainTable from "@/app/profile/[id]/warehouse/[warehouseId]/components/UserWarehouseMainTable";

export default async function Page({params}) {

    return (
        <main>
            <UserWarehouseMainTable ownerId={params.id} warehouseId={params.warehouseId}/>
        </main>
    )
}