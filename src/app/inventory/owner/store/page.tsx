import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import StoresMainTable from "./components/StoresMainTable";
import { getServerSession } from "next-auth";

const Page = async () => {
    const session: any = await getServerSession(nextAuthOptions);
    const userId: number = session?.user.id;
    return (
        <main>
            <StoresMainTable userId={userId} />
        </main>
    )
}

export default Page