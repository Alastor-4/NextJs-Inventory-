import { EditOutlined } from '@mui/icons-material'
import { Collapse, Grid, IconButton, Typography } from '@mui/material'
import React, { useState } from 'react'
import StoreListOffers from './offers/components/StoreListOffers'
import StoreModalDefault from './Modal/StoreModalDefault'
import StoreEditSellerProfit from './Modal/StoreEditSellerProfit'
import {InfoTag, MoneyInfoTag} from "@/components/InfoTags";
import {numberFormat} from "@/utils/generalFunctions";

function StoreMoreDetails(props: any) {
    const {
        details,
        show,
        loadData,
        row,
        baseProductPrice,
        displayProductPrice,
        priceDiscountQuantity,
        displayPriceDiscount,
        sellerProfitQuantity,
        finalProductPrice,
    } = props

    const [activeModalSellerProfit, setActiveModalSellerProfit] = useState(false);

    const showSellerProfit = (priceProductStore: any, discountQuantity: any, discountPorcentage: any) => {
        let pricePorcentage = (discountPorcentage !== null) ? (discountPorcentage * priceProductStore / 100).toFixed(2) : null;

        let price = discountQuantity ?? pricePorcentage ?? priceProductStore;

        const valuePercentage = (details.seller_profit_percentage !== null) ? (details.seller_profit_percentage * price / 100).toFixed(2) : null;
        if (valuePercentage !== null) return `${details.seller_profit_percentage}%`
        return `${details.seller_profit_quantity} CUP`
    }

    return (
        <>
            <StoreModalDefault
                dialogTitle={"Editar ganacia del vendedor"}
                open={activeModalSellerProfit}
                setOpen={setActiveModalSellerProfit}
            >
                <StoreEditSellerProfit
                    storeDepot={details}
                    setActiveModalSellerProfit={setActiveModalSellerProfit}
                    loadData={loadData}
                />
            </StoreModalDefault>

            <Collapse in={show} timeout="auto" unmountOnExit>
                <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom component="div">
                            Detalles:
                        </Typography>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
                        <Grid item xs={true}>
                            {row.name}
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                        <Grid item xs={true}>
                            {row.description ? row.description : "-"}
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                        <Grid item xs={true}>{row.departments?.name ?? "-"}</Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                        <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                            {row.characteristics.length > 0
                                ? row.characteristics.map((item: any) => (
                                    <Grid
                                        key={item.id}
                                        sx={{
                                            display: "inline-flex",
                                            margin: "3px",
                                            backgroundColor: "rgba(170, 170, 170, 0.8)",
                                            padding: "2px 4px",
                                            borderRadius: "5px 2px 2px 2px",
                                            border: "1px solid rgba(130, 130, 130)",
                                            fontSize: 14,
                                        }}
                                    >
                                        <Grid container item alignItems={"center"} sx={{ marginRight: "3px" }}>
                                            <Typography variant={"caption"}
                                                sx={{ color: "white", fontWeight: "600" }}>
                                                {item.name.toUpperCase()}
                                            </Typography>
                                        </Grid>
                                        <Grid container item alignItems={"center"}
                                            sx={{ color: "rgba(16,27,44,0.8)" }}>
                                            {item.value}
                                        </Grid>
                                    </Grid>
                                )) : "-"
                            }
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio
                            base:</Grid>
                        <Grid item xs={true}>
                            {
                                baseProductPrice
                                    ? baseProductPrice + " " + row.depots[0].store_depots[0].sell_price_unit
                                    : "sin precio"
                            }
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio:</Grid>
                        <Grid item xs={true}>
                            <MoneyInfoTag
                                value={displayProductPrice}
                                errorColor={!baseProductPrice}
                            />
                            {
                                priceDiscountQuantity && (
                                    <InfoTag value={`- ${displayPriceDiscount} descuento`} />
                                )
                            }
                        </Grid>
                    </Grid>

                    {
                        row?.depots![0].store_depots![0].discount_description && (
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Razón de la rebaja:</Grid>
                                <Grid item xs={true}>
                                    {row?.depots![0].store_depots![0].discount_description}
                                </Grid>
                            </Grid>
                        )
                    }

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Salario vendedor:</Grid>
                        <Grid item container xs={true}>
                            <Grid item>
                                {
                                    row?.depots![0].store_depots![0].seller_profit_percentage
                                        ? `${row?.depots![0].store_depots![0].seller_profit_percentage} %`
                                        : `${row?.depots![0].store_depots![0].seller_profit_quantity} CUP`
                                }
                            </Grid>

                            <Grid item>
                                <IconButton sx={{ padding: 0 }} size="small" color="primary" onClick={() => setActiveModalSellerProfit(true)} >
                                    <EditOutlined fontSize="small" />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"}
                              sx={{ fontWeight: 600 }}>Distribución:</Grid>
                        <Grid item xs={true}>
                            {
                                (baseProductPrice && sellerProfitQuantity && finalProductPrice)
                                    ? `Dueño: ${numberFormat(String(finalProductPrice - sellerProfitQuantity))} | Vendedor: ${numberFormat(sellerProfitQuantity)}`
                                    : "-"
                            }
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades:</Grid>
                        <Grid item container xs={true}>
                            {
                                `Qudan: ${row.depots[0].store_depots[0].product_remaining_units} | ${row.depots[0].store_depots[0].product_units} :Total ingresado`
                            }
                        </Grid>
                    </Grid>

                    <StoreListOffers
                        priceProduct={row.depots[0].store_depots[0].sell_price}
                        currency={row.depots[0].store_depots[0].sell_price_unit}
                        storeDepotId={row.depots[0].store_depots[0].id}
                    />
                </Grid>
            </Collapse>
        </>
    )
}

export default StoreMoreDetails
