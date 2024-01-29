import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoresForm from "../../components/StoresForm";
import { getServerSession } from "next-auth";
import { prisma } from "db";

export const dynamic = "force-dynamic";

async function fetchSellers(userId: number) {
    return prisma.users.findMany({ where: { work_for_user_id: userId, roles: { name: "store_seller" } } });
}

const Page = async ({ params }: { params: { storeid: string } }) => {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;
    const storeId = +params.storeid;
    const sellerUsers = await fetchSellers(userId!);

    return (
        <main>
            <StoresForm userId={userId} storeId={storeId} sellerUsers={sellerUsers} />
        </main>
    )
}

export default Page

