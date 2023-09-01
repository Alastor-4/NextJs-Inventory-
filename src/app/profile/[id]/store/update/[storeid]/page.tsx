import StoresForm from "@/app/profile/[id]/store/components/StoresForm";


export default function Page({params}) {
    const userId = params.id;
    const storeId = params.storeid;
    return (
        <main>
            <StoresForm userId = {userId} storeId = {storeId} />
        </main>
    )
}