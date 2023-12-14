import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoreMainTable from "./components/StoreMainTable";
import { getServerSession } from "next-auth";

export default async function page() {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user.id;

  return (
    <main>
      <StoreMainTable userId={userId} />
    </ main>
  )
}
