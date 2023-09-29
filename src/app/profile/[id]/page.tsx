import {prisma} from "db";
import UserProfileMain from "@/app/profile/components/UserProfileMain";

export default async function Page({params}) {
    const userId = parseInt(params.id)
    const userDetails = await prisma.users.findUnique({where: {id: userId}, include: {roles: true}})
    const userRole = userDetails.roles?.name ?? "user"

    let ownerWarehouses = null
    let ownerStores = null
    let ownerProductsCount = null
    let ownerWorkersCount = null

    let sellerStores = null

    if (userRole === "store_owner") {
        const ownerWarehousesPromise = prisma.warehouses.findMany({where: {owner_id: userId}})
        const ownerStoresPromise = prisma.stores.findMany({where: {owner_id: userId}})
        const productsCountPromise = prisma.products.count({where: {owner_id: userId}})
        const workersCountPromise = prisma.users.count({where: {work_for_user_id: userId}})

        const ownerQueries = await Promise.all([ownerWarehousesPromise, ownerStoresPromise, productsCountPromise, workersCountPromise])
        ownerWarehouses = ownerQueries[0]
        ownerStores = ownerQueries[1]
        ownerProductsCount = ownerQueries[2]
        ownerWorkersCount = ownerQueries[3]
        sellerStores = ownerQueries[1]
    }

    if (userRole === "store_seller") {
        sellerStores = await prisma.stores.findMany({where: {seller_user_id: userId}})
    }

    return (
        <main>
            <UserProfileMain
                userDetails={userDetails}
                userRole={userRole}
                ownerWarehouses={ownerWarehouses}
                ownerStores={ownerStores}
                ownerProductsCount={ownerProductsCount}
                ownerWorkersCount={ownerWorkersCount}
                sellerStores={sellerStores}
            />
        </main>
    )
}