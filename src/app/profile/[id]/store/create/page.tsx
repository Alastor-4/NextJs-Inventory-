import StoresForm from "@/app/profile/[id]/store/components/StoresForm";

export default async function Page({params}) {
    const userId = params.id
    return (
        <main>
            <StoresForm userId={userId}/>
        </main>
    )
}