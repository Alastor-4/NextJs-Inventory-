import MainTable from "@/components/MainTable";
import {getAllRoles} from "@/queries/roles";


export default async function Page() {
    const roles = await getAllRoles()

    const headCells = [
        {
            id: "name",
            label: "Nombre",
            align: "left"
        },
        {
            id: "description",
            label: "Descripción",
            align: "left"
        },
    ]

    return (
        <main>
            <MainTable title={"Listado de roles"} headCells={headCells} items={roles ?? []}/>
        </main>
    )
}