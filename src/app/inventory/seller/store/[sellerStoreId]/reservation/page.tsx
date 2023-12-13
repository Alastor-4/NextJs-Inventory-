//import StoreReservation from "@/app/inventory/seller/store/[sellerStoreId]/reservation/components/StoreReservation"
import StoreReservation from "./newReservation/components/StoreReservation"
import {getServerSession} from "next-auth";
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

export default async function Page({params}: { params: { sellerStoreId: string } }) {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id
    const storeId = params.sellerStoreId

    return (
        <main>
            {/*@ts-ignore*/}
            <StoreReservation userId={userId} storeId={storeId}/>
        </main>
    )
}