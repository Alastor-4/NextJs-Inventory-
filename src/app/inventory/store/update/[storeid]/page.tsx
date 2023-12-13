import StoresForm from "@/app/inventory/store/components/StoresForm";
import { prisma } from "db";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function Page({ params }: { params: { storeid: string } }) {
    const session: any = await getServerSession(nextAuthOptions)
    const userId: number = session?.user.id
    const storeId: string = params.storeid
    const sellerUsers = await prisma.users.findMany({ where: { work_for_user_id: userId, roles: { name: "store_seller" } } })

    return (
        <main>
            <StoresForm userId={userId} storeId={storeId} sellerUsers={sellerUsers} />
        </main>
    )
}

