import StoreMainTable from "./components/StoreMainTable"
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function page() {
  const session: any = await getServerSession(nextAuthOptions)
  const userId: number = session?.user.id

  return (
    <main>
      <StoreMainTable userId={userId} />

    </ main>
  )
}
