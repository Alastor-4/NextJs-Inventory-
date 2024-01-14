'use client'

import { Grid } from '@mui/material';
import { storeSellsDetailsProps } from '@/types/interfaces';
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const SellsHistory = () => {
    const params = useParams();
    const sellerStoreId = +params.sellerStoreId!;

    const [allSells, setAllSells] = useState<storeSellsDetailsProps[] | null>(null);


    useEffect(() => {
        const loadData = async () => {
            const storeAllSellsDetails: storeSellsDetailsProps[] = await stores.storeSellsDetails(sellerStoreId, true);
            setAllSells(storeAllSellsDetails);
        }
        loadData();
    }, [sellerStoreId]);

    return (
        <>
            {allSells?.map((sell) =>
                <Grid key={sell.id}>
                    <Grid>
                        {sell.sell_products[0].store_depots.depots?.products?.name}
                    </Grid>
                    <Grid>
                        Dia: {sell.created_at.toString()}
                    </Grid>
                </Grid>
            )}
        </>
    )
}

export default SellsHistory