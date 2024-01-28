import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoresMainTable from "./components/StoresMainTable";
import { getServerSession } from "next-auth";
import { prisma } from "@/db";

export default async function Page() {
    const session: any = await getServerSession(nextAuthOptions);
    const userId: number = session?.user.id;
    const user = await prisma.users.findUnique({ where: { id: userId } });

    return (
        <main>
            <StoresMainTable userId={userId} ownerId={user?.work_for_user_id!} />
        </main>
    )
}