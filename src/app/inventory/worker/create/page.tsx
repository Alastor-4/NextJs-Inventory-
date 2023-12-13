import WorkersForm from "@/app/inventory/worker/components/WorkersForm";
import {getServerSession} from "next-auth";
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions)
    const ownerId = session?.user.id

    return (
        <main>
            <WorkersForm ownerId={ownerId}/>
        </main>
    )
}