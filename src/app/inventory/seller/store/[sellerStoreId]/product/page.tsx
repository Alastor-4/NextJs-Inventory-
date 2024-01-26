import StoreActionsMain from "@/app/inventory/seller/store/[sellerStoreId]/product/components/StoreActionsMain";

const Page = ({ params }: { params: { id: string, sellerStoreId: string } }) => {
    const storeId: number = +params.sellerStoreId!;

    return (
        <main>
            <StoreActionsMain storeId={storeId} />
        </main>
    )
}

export default Page