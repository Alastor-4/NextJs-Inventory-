import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import ProductsMainTable from "./components/ProductsMainTable";
import { getServerSession } from "next-auth";
import { prisma } from "@/db";

const Page = async () => {
    const session: any = await getServerSession(nextAuthOptions);
    const userId: number = session?.user.id;
    const user = await prisma.users.findUnique({ where: { id: userId! } });

    return (
        <main>
            <ProductsMainTable userId={userId} ownerId={user?.work_for_user_id!} />
        </main>
    )
}

export default Page