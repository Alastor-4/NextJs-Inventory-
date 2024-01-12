import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoresForm from "../components/StoresForm";
import { getServerSession } from "next-auth";
import { prisma } from "db";

export const dynamic = "force-dynamic";

async function fetchSellers(userId: number) {
    return prisma.users.findMany({where: {work_for_user_id: userId, roles: {name: "store_seller"}}});
}

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;
    const sellerUsers: any = await fetchSellers(userId!)

    return (
        <main>
            <StoresForm userId={userId} storeId={undefined} sellerUsers={sellerUsers} />
        </main>
    )
}