import ProductsForm from "@/app/inventory/product/components/ProductsForm";
import { prisma } from "db";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";

const getData = () => prisma.departments.findMany()

export default async function Page() {
    const session: any = await getServerSession(nextAuthOptions)
    const userId: number = session?.user.id

    const departments = await getData()

    return (
        <main>
            <ProductsForm userId={userId} departments={departments} />
        </main>
    )
}