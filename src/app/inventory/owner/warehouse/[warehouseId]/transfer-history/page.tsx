import WarehouseTransferHistory
    from "@/app/inventory/owner/warehouse/[warehouseId]/transfer-history/components/WarehouseTransferHistory";


const Page = async ({ params }: { params: { warehouseId: string } }) => {
    const warehouseId = +params.warehouseId;

    return (
        <main>
            <WarehouseTransferHistory warehouseId={warehouseId} />
        </main>
    )
}

export default Page