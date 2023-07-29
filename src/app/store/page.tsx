import {prisma} from "db";

export default async function Page() {
    const response = await prisma.roles.findMany()

    return (
        <main>
            stores
        </main>
    )
}