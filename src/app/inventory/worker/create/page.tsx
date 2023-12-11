import WorkersForm from "@/app/inventory/worker/components/WorkersForm";

export default async function Page({params}: {params: {id: string}}) {
    const ownerId = params.id

    return (
        <main>
            <WorkersForm ownerId={ownerId}/>
        </main>
    )
}