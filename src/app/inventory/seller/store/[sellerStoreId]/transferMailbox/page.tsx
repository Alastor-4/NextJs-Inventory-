import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import SellerTransferMailBox from "./components/SellerTransferMailBox";

interface Params {
    params: { sellerStoreId: string },
    searchParams: { sent: string }
}


export default async function Page({ params, searchParams }: Params) {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id
    const sent = searchParams.sent === 'false' ? false : true

    return (
        <main>
            <SellerTransferMailBox userId={+userId!} storeId={+params.sellerStoreId!} sent={sent} />
        </main>
    )
}