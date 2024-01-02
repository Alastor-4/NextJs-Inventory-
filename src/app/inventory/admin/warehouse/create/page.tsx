import WarehousesForm from "../components/WarehousesForm";
import { prisma } from "db";

export default async function Page() {

    return (
        <main>
            <WarehousesForm />
        </main>
    )
}