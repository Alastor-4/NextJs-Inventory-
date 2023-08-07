import {prisma} from "db";
import UserProfileMain from "@/app/profile/components/UserProfileMain";

async function fetchUserData(id) {
    return await prisma.users.findUnique({where: {id: parseInt(id)}, include: {warehouses: true, stores: true, roles: true}})
}
export default async function Page({params}) {
    const userDetails = await fetchUserData(params.id)
    console.log(userDetails)
    return (
        <main>
            <UserProfileMain userDetails={userDetails}/>
        </main>
    )
}