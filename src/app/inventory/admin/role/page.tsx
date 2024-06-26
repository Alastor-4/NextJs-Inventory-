import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import RolesMainTable from "./components/RolesMainTable";
import { getServerSession } from "next-auth";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;

    return (
        <main>
            <RolesMainTable userId={userId} />
        </main>
    )
}