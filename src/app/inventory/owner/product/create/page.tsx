import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import ProductsForm from "../components/ProductsForm";
import { getServerSession } from "next-auth";
import { prisma } from "db";

const getData = () => prisma.departments.findMany();

export default async function Page() {
    const session = await getServerSession(nextAuthOptions);
    const userId = session?.user.id;

    const departments = await getData();

    return (
        <main>
            <ProductsForm userId={userId} departments={departments} />
        </main>
    )
}