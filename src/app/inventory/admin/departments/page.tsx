import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import AdminDepartmentsMainTable from "./components/AdminDepartmentsMainTable";
import { getServerSession } from "next-auth";

const Page = async () => {
    const session: any = await getServerSession(nextAuthOptions);
    const userId: number = session?.user.id;

    return (
        <main>
            <AdminDepartmentsMainTable />
        </main>
    )
}

export default Page