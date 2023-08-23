import ProductsForm from "@/app/profile/[id]/product/components/ProductsForm";
import {prisma} from "db";

const getData = () => prisma.departments.findMany()

export default async function Page({params}) {
    const userId = params.id
    const departments = await getData()

    return (
        <main>
            <ProductsForm userId={userId} departments={departments}/>
        </main>
    )
}