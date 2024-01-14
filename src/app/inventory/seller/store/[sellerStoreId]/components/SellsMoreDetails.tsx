import { SellsMoreDetailsProps } from '@/types/interfaces';
import { Card, Collapse, Grid } from '@mui/material';
import React from 'react';

const SellsMoreDetails = ({ show, sell_products }: SellsMoreDetailsProps) => {

    return (
        <Collapse in={show} timeout="auto" unmountOnExit>
            {sell_products.map((sell_product) =>
                <Card key={sell_product.id} variant='outlined' sx={{ m: "3px" }}>
                    <Grid container justifyContent={"space-evenly"} sx={{ p: "5px 10px" }}>
                        <Grid container item spacing={1} xs={3} alignItems={"end"}>
                            <Grid item xs={12} sx={{ fontWeight: 600 }} >
                                Producto:
                            </Grid>
                            <Grid item xs={12} display={"flex"} justifyContent={"center"} >
                                {sell_product.store_depots.depots?.products?.name}
                            </Grid>
                        </Grid>
                        <Grid container item spacing={1} xs={3} alignItems={"end"}>
                            <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                Precio:
                            </Grid>
                            <Grid item xs={12} display={"flex"} justifyContent={"center"}>
                                {!!sell_product.store_depots.price_discount_quantity ?
                                    `${(sell_product.store_depots.sell_price - sell_product.store_depots.price_discount_quantity)} ${sell_product.store_depots.sell_price_unit}`
                                    :
                                    !!sell_product.store_depots.price_discount_percentage ?
                                        `${(sell_product.store_depots.sell_price / 100) * (100 - sell_product.store_depots.price_discount_percentage)} ${sell_product.store_depots.sell_price_unit}`
                                        :
                                        `${sell_product.store_depots.sell_price} ${sell_product.store_depots.sell_price_unit}`
                                }
                            </Grid>
                        </Grid>
                        <Grid container item spacing={1} xs={3} >
                            <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                Cantidad vendida:
                            </Grid>
                            <Grid item xs={12} display={"flex"} justifyContent={"center"} >
                                {sell_product.units_quantity}
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>
            )}
        </Collapse>
    )
}

export default SellsMoreDetails