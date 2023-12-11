import RolesForm from "../../components/RolesForm"
import {getServerSession} from "next-auth";
import {nextAuthOptions} from "@/app/api/auth/[...nextauth]/options";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions)
    const userId = session?.user.id

    return (
        <main>
            <RolesForm userId={userId}/>
        </main>
    )
}