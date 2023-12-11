//import StoreReservation from "@/app/profile/[id]/seller/store/[sellerStoreId]/reservation/components/StoreReservation"
import StoreReservation from "./newReservation/components/StoreReservation"
export default function Page({ params }: { params: { id: string, sellerStoreId: string } }) {
    const userId = params.id
    const storeId = params.sellerStoreId

    return (
        <main>
            <StoreReservation userId={userId} storeId={storeId} />
        </main>
    )
}