import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import SellerTransferMailBox from "./components/SellerTransferMailBox";

interface Params {
    params: { sellerStoreId: string }
}

export default async function Page({ params }: Params) {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id

    return (
        <main>

            <SellerTransferMailBox userId={+userId!} storeId={+params.sellerStoreId!} />
        </main>
    )
}