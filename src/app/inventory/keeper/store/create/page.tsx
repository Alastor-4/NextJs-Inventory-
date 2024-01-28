import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoresForm from "../components/StoresForm";
import { getServerSession } from "next-auth";
import { users } from "@prisma/client";
import { prisma } from "db";

export const dynamic = "force-dynamic";

async function fetchSellers(ownerId: number) {
    return prisma.users.findMany({ where: { work_for_user_id: ownerId, roles: { name: "store_seller" } } });
}

const Page = async () => {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;
    const user = await prisma.users.findUnique({ where: { id: userId } });
    const sellerUsers: users[] | null = await fetchSellers(user?.work_for_user_id!);

    return (
        <main>
            <StoresForm ownerId={user?.work_for_user_id!} storeId={undefined} sellerUsers={sellerUsers} />
        </main>
    )
}

export default Page