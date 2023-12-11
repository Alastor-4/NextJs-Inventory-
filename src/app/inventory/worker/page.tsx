import WorkersMainTable from "@/app/profile/[id]/worker/components/WorkersMainTable";
import {prisma} from "db";

export default async function Page() {
    const roles = await prisma.roles.findMany()
    const ownerUsageRoles = roles.filter(item => item.name === "store_keeper" || item.name === "store_seller")

    return (
        <main>
            <WorkersMainTable roles={ownerUsageRoles}/>
        </main>
    )
}