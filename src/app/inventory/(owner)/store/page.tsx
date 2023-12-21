import StoresMainTable from "./components/StoresMainTable"
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";

export default async function Page() {
    const session: any = await getServerSession(nextAuthOptions)
    const userId: number = session?.user.id
    return (
        <main>
            <StoresMainTable userId={userId} />
        </main>
    )
}