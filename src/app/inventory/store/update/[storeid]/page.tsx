import StoresForm from "@/app/inventory/store/components/StoresForm";
import {prisma} from "db";


export default async function Page({params}: {params: {id: string, storeid: string}}) {
    const userId = params.id;
    const storeId = params.storeid;

    const sellerUsers = await prisma.users.findMany({where: {work_for_user_id: parseInt(userId), roles: {name: "store_seller"}}})
    return (
        <main>
            <StoresForm userId={userId} storeId={storeId} sellerUsers={sellerUsers}/>
        </main>
    )
}

