import WorkersForm from "@/app/profile/[id]/worker/components/WorkersForm";

export default async function Page({params}) {
    const ownerId = params.id

    return (
        <main>
            <WorkersForm ownerId={ownerId}/>
        </main>
    )
}