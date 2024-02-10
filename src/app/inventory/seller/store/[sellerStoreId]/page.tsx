import StoreMain from "@/app/inventory/seller/store/[sellerStoreId]/components/StoreMain";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { Session, getServerSession } from "next-auth";

const Page = async () => {
    const session: Session | null = await getServerSession(nextAuthOptions);
    const userId: number | null = session?.user.id!;

    return (<main><StoreMain userId={userId} /></main>)
}

export default Page