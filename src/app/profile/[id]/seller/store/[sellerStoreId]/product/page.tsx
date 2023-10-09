import StoreActionsMain from "@/app/profile/[id]/seller/store/[sellerStoreId]/product/components/StoreActionsMain"

export default function Page({params}) {
    const userId = params.id
    const storeId = params.sellerStoreId

    return (
        <main>
            <StoreActionsMain userId={userId} storeId={storeId}/>
        </main>
    )
}