import StoreActionsMain from "@/app/inventory/seller/store/[sellerStoreId]/product/components/StoreActionsMain"
import {getServerSession} from "next-auth";
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

export default async function Page({params}: { params: { id: string, sellerStoreId: string } }) {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id
    const storeId = params.sellerStoreId

    return (
        <main>
            {/*@ts-ignore*/}
            <StoreActionsMain userId={userId} storeId={storeId}/>
        </main>
    )
}