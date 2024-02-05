import { nextAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import ProductsMainTable from "./components/ProductsMainTable";
import { getServerSession } from "next-auth";

const Page = async () => {
    const session: any = await getServerSession(nextAuthOptions);
    const userId: number = session?.user.id;
    const userRoleId: number = session?.user.role_id;

    return (
        <main>
            <ProductsMainTable userId={userId} userRoleId={userRoleId}/>
        </main>
    )
}

export default Page