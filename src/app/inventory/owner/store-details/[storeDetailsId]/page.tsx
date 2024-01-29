import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoreMainTable from "./components/StoreMainTable";
import { getServerSession } from "next-auth";

const Page = async () => {
  const session = await getServerSession(nextAuthOptions);
  const userId: number | undefined = session?.user.id;

  return (
    <main>
      <StoreMainTable userId={userId} />
    </ main>
  )
}
export default Page
