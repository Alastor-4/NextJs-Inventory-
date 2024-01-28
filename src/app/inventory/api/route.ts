import { NextResponse } from 'next/server';
import { prisma } from "db";

// user stats
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const userDetails = await prisma.users.findUnique({ where: { id: +userId! }, include: { roles: true } });
        const userRole = userDetails?.roles?.name ?? "user";

        let ownerWarehouses = null;
        let ownerStores = null;
        let ownerProductsCount = null;
        let ownerWorkersCount = null;
        let globalAndOwnerDepartments = null;

        let sellerStores = null;

        if (userRole === "store_owner") {
            const ownerWarehousesPromise = prisma.warehouses.findMany({ where: { owner_id: +userId! }, include: { depots: true } });
            const ownerStoresPromise = prisma.stores.findMany({ where: { owner_id: +userId! } });
            const productsCountPromise = prisma.products.count({ where: { owner_id: +userId! } });
            const workersCountPromise = prisma.users.count({ where: { work_for_user_id: +userId! } });
            const departmentsPromise = prisma.departments.findMany({ where: { OR: [{ usersId: null }, { usersId: +userId! }] } }); //global or user's department

            const ownerQueries = await Promise.all([ownerWarehousesPromise, ownerStoresPromise, productsCountPromise, workersCountPromise, departmentsPromise]);
            ownerWarehouses = ownerQueries[0];
            ownerStores = ownerQueries[1];
            ownerProductsCount = ownerQueries[2];
            ownerWorkersCount = ownerQueries[3];
            sellerStores = ownerQueries[1];
            globalAndOwnerDepartments = ownerQueries[4];
        }

        if (userRole === "store_keeper") {
            const productsCountPromise = await prisma.products.count({ where: { owner_id: userDetails?.work_for_user_id! } });
            const ownerStoresPromise = prisma.stores.findMany({ where: { owner_id: userDetails?.work_for_user_id! } });
            const ownerWarehousesPromise = await prisma.warehouses.findMany({ where: { owner_id: userDetails?.work_for_user_id! }, include: { depots: true } });

            const ownerQueries = await Promise.all([productsCountPromise, ownerStoresPromise, ownerWarehousesPromise]);
            ownerProductsCount = ownerQueries[0];
            ownerStores = ownerQueries[1];
            ownerWarehouses = ownerQueries[2];
        }
        if (userRole === "store_seller") {
            sellerStores = await prisma.stores.findMany({ where: { seller_user_id: +userId! } })
        }

        return NextResponse.json(
            {
                userDetails,
                userRole,
                ownerWarehouses,
                ownerStores,
                ownerProductsCount,
                ownerWorkersCount,
                globalAndOwnerDepartments,
                sellerStores
            }
        )
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}