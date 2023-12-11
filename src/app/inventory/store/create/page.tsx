import StoresForm from "@/app/profile/[id]/store/components/StoresForm";
import {prisma} from "db";

export default async function Page({params}: {params: {id: string}}) {
    const userId = params.id
    const sellerUsers = await prisma.users.findMany({where: {work_for_user_id: parseInt(userId), roles: {name: "store_seller"}}})

    return (
        <main>
            <StoresForm userId={userId} sellerUsers={sellerUsers}/>
       
        </main>
    )
}