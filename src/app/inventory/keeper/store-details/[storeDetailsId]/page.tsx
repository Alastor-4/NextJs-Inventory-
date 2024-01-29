import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoreMainTable from "./components/StoreMainTable";
import { getServerSession } from "next-auth";
import { prisma } from "@/db";

export const dynamic = "force-dynamic";

const Page = async () => {
  const session = await getServerSession(nextAuthOptions);
  const userId: number | undefined = session?.user.id;
  const user = await prisma.users.findUnique({ where: { id: userId } });

  return (
    <main>
      <StoreMainTable userId={userId} ownerId={user?.work_for_user_id!} />
    </ main>
  )
}
export default Page
