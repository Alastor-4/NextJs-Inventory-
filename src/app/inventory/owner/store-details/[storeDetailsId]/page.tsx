import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoreMainTable from "./components/StoreMainTable";
import { getServerSession } from "next-auth";

export default async function page({params}: {params: { storeDetailsId: number }}) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user.id;
  const storeDetailsId = params.storeDetailsId;

  return (
    <main>
      <StoreMainTable userId={userId} storeDetailsId={storeDetailsId} />
    </ main>
  )
}
