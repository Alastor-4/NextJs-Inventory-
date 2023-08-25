import {prisma} from "db";
import UserProfileMain from "@/app/profile/components/UserProfileMain";

async function fetchUserData(id) {
    const promise1 = prisma.users.findUnique({where: {id: parseInt(id)}, include: {warehouses: true, stores: true, roles: true}})
    const promise2 = prisma.products.count({where: {owner_id: parseInt(id)}})
    const promise3 = prisma.users.count({where: {work_for_user_id: parseInt(id)}})

    return Promise.all([promise1, promise2, promise3])
}
export default async function Page({params}) {
    const response = await fetchUserData(params.id)
    return (
        <main>
            <UserProfileMain userDetails={response[0]} userProductsCount={response[1]} workForUsersCount={response[2]}/>
        </main>
    )
}