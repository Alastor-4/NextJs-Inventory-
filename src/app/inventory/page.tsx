import UserProfileMain from "@/app/inventory/components/UserProfileMain";
import { nextAuthOptions } from '../api/auth/[...nextauth]/options';
import { getServerSession } from "next-auth";

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);

    const userId = session?.user.id

    return (
        <main>
            <UserProfileMain userId={userId!} />
        </main>
    )
}