import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import DepartmentsMainTable from "./components/DepartmentsMainTable";
import { getServerSession } from "next-auth";

const Page = async () => {
    const session: any = await getServerSession(nextAuthOptions);
    const userId: number = session?.user.id;

    return (
        <main>
            <DepartmentsMainTable userId={userId} />
        </main>
    )
}

export default Page