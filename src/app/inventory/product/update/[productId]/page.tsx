import ProductsForm from "@/app/inventory/product/components/ProductsForm";
import {prisma} from "db";

const getData = () => prisma.departments.findMany()

export default async function Page({params}: {params: {id: string}}) {
    const userId = params.id
    const departments = await getData()

    return (
        <main>
            <ProductsForm userId={userId} departments={departments}/>
        </main>
    )
}