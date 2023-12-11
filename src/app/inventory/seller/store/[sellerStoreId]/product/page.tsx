import StoreActionsMain from "@/app/inventory/seller/store/[sellerStoreId]/product/components/StoreActionsMain"

export default function Page({params}: {params: {id: string, sellerStoreId: string}}) {
    const userId = params.id
    const storeId = params.sellerStoreId

    return (
        <main>
            <StoreActionsMain userId={userId} storeId={storeId}/>
        </main>
    )
}