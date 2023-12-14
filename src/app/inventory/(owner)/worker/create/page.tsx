
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import WorkersForm from "../components/WorkersForm";
import { getServerSession } from "next-auth";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);
    const ownerId = session?.user.id;

    return (
        <main>
            <WorkersForm ownerId={ownerId} />
        </main>
    )
}