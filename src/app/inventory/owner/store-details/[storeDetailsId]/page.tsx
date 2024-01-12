import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoreMainTable from "./components/StoreMainTable";
import { storeWithStoreDepots } from "@/types/interfaces";
import { getServerSession } from "next-auth";
import { prisma } from "@/db";

export default async function page({ params }: { params: { storeDetailsId: string } }) {
  const session = await getServerSession(nextAuthOptions);
  const userId = session?.user.id;
  const storeDetailsId = +params.storeDetailsId!;
  const dataStore: storeWithStoreDepots | null = await prisma.stores.findUnique({ where: { id: storeDetailsId }, include: { store_depots: true } });

  return (
    <main>
      <StoreMainTable userId={userId} dataStoreDetails={dataStore!} />
    </ main>
  )
}
