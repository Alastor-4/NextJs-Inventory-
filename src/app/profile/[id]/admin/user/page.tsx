import UsersMainTable from "./components/UsersMainTable";
import { prisma } from "db";

export default async function Page() {
    const roles = await prisma.roles.findMany()
    return (
        <main>
            <UsersMainTable roles={roles} />
        </main>
    )
}