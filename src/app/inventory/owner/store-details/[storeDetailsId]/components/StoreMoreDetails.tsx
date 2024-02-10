import { EditOutlined, SwapVert } from '@mui/icons-material'
import {Box, Collapse, Grid, IconButton, Typography} from '@mui/material'
import React, { useState } from 'react'
import StoreListOffers from './offers/components/StoreListOffers'
import StoreModalDefault from './Modal/StoreModalDefault'
import StoreEditSellerProfit from './Modal/StoreEditSellerProfit'
import { InfoTag, MoneyInfoTag } from "@/components/InfoTags";
import { numberFormat } from "@/utils/generalFunctions";
import TransferUnits from "@/app/inventory/owner/store-details/[storeDetailsId]/components/Modal/TransferUnits";
import StoreEditUnits from "@/app/inventory/owner/store-details/[storeDetailsId]/components/Modal/StoreEditUnits";
import { storeDepotsWithAny } from "@/types/interfaces";
import ModalProductPrice from "@/app/inventory/owner/store-details/[storeDetailsId]/components/Modal/ModalProductPrice";

function StoreMoreDetails(props: any) {
    const {
        show,
        userId,
        loadData,
        row,
        dataStore,
        baseProductPrice,
        displayProductPrice,
        priceDiscountQuantity,
        displayPriceDiscount,
        sellerProfitQuantity,
        finalProductPrice,
    } = props

    const [activeModalPrice, setActiveModalPrice] = useState<{ active: boolean, storeDepot: storeDepotsWithAny | null }>({ active: false, storeDepot: null });
    const [activeModalSellerProfit, setActiveModalSellerProfit] = useState(false);
    const [activeModalTransferUnits, setActiveModalTransferUnits] = useState<boolean>(false);
    const [activeModalEditUnits, setActiveModalEditUnits] = useState<boolean>(false);

    return (
        <>
            <ModalProductPrice
                dialogTitle="Modificar Precio"
                activeModalPrice={activeModalPrice.active}
                storeDepot={row.depots[0].store_depots[0]}
                setActiveModalPrice={setActiveModalPrice}
                loadData={loadData}
            />

            <StoreModalDefault
                dialogTitle={"Transferir almacén - tienda"}
                open={activeModalTransferUnits}
                setOpen={setActiveModalTransferUnits}
            >
                <TransferUnits
                    userId={userId}
                    nameStore={dataStore?.name!}
                    storeDepot={row.depots[0].store_depots[0]}
                    productId={row.id}
                    setActiveTransferUnits={setActiveModalTransferUnits}
                    loadData={loadData}
                />
            </StoreModalDefault>

            <StoreModalDefault
                dialogTitle={"Total recibido"}
                open={activeModalEditUnits}
                setOpen={setActiveModalEditUnits}
            >
                <StoreEditUnits
                    dataRow={row.depots[0].store_depots[0]}
                    setActiveModalEditUnits={setActiveModalEditUnits}
                    loadData={loadData}
                />
            </StoreModalDefault>

            <StoreModalDefault
                dialogTitle={"Salario del vendedor"}
                open={activeModalSellerProfit}
                setOpen={setActiveModalSellerProfit}
            >
                <StoreEditSellerProfit
                    storeDepot={row.depots[0].store_depots[0]}
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
                                    <Box key={item.id} display={"inline-flex"} mr={"5px"}>
                                        {`${item.name.toUpperCase()} = ${item.value}`}
                                    </Box>
                                )) : "-"
                            }
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precios del producto:</Grid>
                        <Grid container item xs={true}>
                            <Grid item xs={12}>
                                Costo: {row.buy_price} {row.buy_price ? "CUP" : "-"}
                            </Grid>
                            <Grid item xs={12}>
                                Venta: {row.fixed_sell_price} {row.fixed_sell_price ? row.fixed_sell_price_unit : "-"}
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio base en tienda:</Grid>
                        <Grid item xs={true}>
                            {
                                baseProductPrice
                                    ? baseProductPrice + " " + row.depots[0].store_depots[0].sell_price_unit
                                    : "sin precio"
                            }
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Precio final en tienda:</Grid>
                        <Grid item xs={true}>
                            <MoneyInfoTag
                                value={displayProductPrice}
                                errorColor={!baseProductPrice}
                                action={() => setActiveModalPrice({ storeDepot: null, active: true })}
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

                    <Grid container item columnSpacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Salario del vendedor:</Grid>
                        <Grid item container xs={true}>
                            <Grid item>
                                {
                                    row?.depots![0].store_depots![0].seller_profit_percentage
                                        ? `${row?.depots![0].store_depots![0].seller_profit_percentage} %`
                                        : row?.depots![0].store_depots![0].seller_profit_quantity
                                            ? `${row?.depots![0].store_depots![0].seller_profit_quantity} CUP`
                                            : "-"
                                }
                            </Grid>

                            <Grid item>
                                <IconButton sx={{ padding: 0 }} size="small" onClick={() => setActiveModalSellerProfit(true)} >
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
                        <Grid item container xs={"auto"} sx={{ fontWeight: 600 }} alignItems={"center"}>Unidades restantes:</Grid>
                        <Grid item container xs={true} alignItems={"center"}>
                            {row.depots[0].store_depots[0].product_remaining_units}

                            <IconButton
                                size={"small"}
                                onClick={() => setActiveModalTransferUnits(true)}
                            >
                                <SwapVert />
                            </IconButton>
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12} alignItems={"center"}>
                        <Grid item container xs={"auto"} sx={{ fontWeight: 600 }} alignItems={"center"}>Unidades recibidas:</Grid>
                        <Grid item container xs={true} alignItems={"center"}>
                            {row.depots[0].store_depots[0].product_units}

                            <IconButton
                                size={"small"}
                                onClick={() => setActiveModalEditUnits(true)}
                            >
                                <EditOutlined />
                            </IconButton>
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
