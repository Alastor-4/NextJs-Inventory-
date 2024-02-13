//@ts-nocheck
"use client"

import {
    AppBar, Box, Card, CardContent,
    Chip, Divider, Grid, IconButton, Switch, Toolbar, Typography
} from "@mui/material";
import {
    ArrowLeft, ChevronRightOutlined, ExpandLessOutlined, ExpandMoreOutlined,
    ForwardToInbox, InfoOutlined, Mail, Schedule
} from "@mui/icons-material"
import {
    productSellsStatsProps, storeDepotsStatsProps, storeDepotsWithAny,
    storeSellsDetailsProps, storeSellsReceivableDetailsProps, storeWithStoreDepots
} from "@/types/interfaces";
import { daysMap, notifySuccess, notifyWarning, numberFormat, transactionToWarehouse } from "@/utils/generalFunctions";
import ModalTransfersToday from "@/app/inventory/seller/store/[sellerStoreId]/components/Modal/ModalTransfersToday";
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import { product_store_transfers, store_depot_transfers } from "@prisma/client";
import userProfileStyles from "@/assets/styles/userProfileStyles";
import { useParams, useRouter } from "next/navigation";
import ModalSellsToday from "./Modal/ModalSellsToday";
import React, { useEffect, useState } from "react";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import Link from "next/link";
import dayjs from "dayjs";
import ModalSellsReceivableToday from "./Modal/ModalSellsReceivableToday";

dayjs.extend(isBetween);
dayjs.extend(utc);

interface DetailsTodayTransfer {
    places: number,
    units: number,
    products: number
    transfers: number
}

interface todayTransferProps {
    fromWarehouse: DetailsTodayTransfer
    toWarehouse: DetailsTodayTransfer
    fromStore: DetailsTodayTransfer
    toStore: DetailsTodayTransfer
    totalTransfers: number
    totalUnits: number
    totalProducts: number
}

interface todayTransferDetails {
    warehouseAndStore: store_depot_transfers[],
    store: product_store_transfers[],
}

const StoreMain = ({ userId }: { userId?: number }) => {
    const params = useParams();
    const router = useRouter();

    const sellerStoreId = +params.sellerStoreId!;

    const [storeDepotsStats, setStoreDepotsStats] = useState<storeDepotsStatsProps | null>(null);
    const [storeDetails, setStoreDetails] = useState<storeWithStoreDepots | null>(null);
    const [todaySellsStats, setTodaySellsStats] = useState<productSellsStatsProps | null>(null);
    const [todaySells, setTodaySells] = useState<storeSellsDetailsProps[] | null>(null);
    const [todayTransfers, setTodayTransfers] = useState<todayTransferProps | null>(null)
    const [todaySellsReceivable, setTodaySellsReceivable] = useState<storeSellsReceivableDetailsProps[] | null>(null)

    //GET initial store and sellsStats details
    useEffect(() => {
        const getDataTransferWarehouseAndStore = (data) => {
            let fromWarehouse = { transfers: 0 }
            let toWarehouse = { transfers: 0 }

            data.forEach((element) => {
                if (element.transfer_direction === transactionToWarehouse) {
                    toWarehouse.transfers++;
                } else {
                    fromWarehouse.transfers++;
                }
            })

            return {
                fromWarehouse: { transfers: fromWarehouse.transfers },
                toWarehouse: { transfers: toWarehouse.transfers }
            }

        }

        const getDataTransferStore = (data) => {
            let fromStore = { transfers: 0 }
            let toStore = { transfers: 0 }

            data.forEach((element) => {
                if (element.to_store_id === sellerStoreId) {
                    fromStore.transfers++
                } else {
                    toStore.transfers++
                }
            })

            return {
                fromStore: { transfers: fromStore.transfers },
                toStore: { transfers: toStore.transfers }
            }
        }

        const loadStatsData = async () => {
            const storeDetailsPromise = stores.storeDetails(userId!, sellerStoreId);
            const storeTodaySellsDetailsPromise = stores.storeSellsDetails(sellerStoreId);
            const storeTodayTransferDetailsPromise = stores.getTodayTransfersStats(sellerStoreId)
            const storeTodaySellsReceivablePromise = stores.getSellsReceivableDetails(sellerStoreId)

            const [storeDetails, storeTodaySellsDetails, storeTodayTransferDetails, storeTodaySellsReceivable] =
                await Promise.all([storeDetailsPromise, storeTodaySellsDetailsPromise, storeTodayTransferDetailsPromise, storeTodaySellsReceivablePromise]);

            if (storeDetails) {
                setStoreDetails(storeDetails);

                const depotsTotal: number = storeDetails.store_depots?.length!;
                let depotsRemainingUnitsTotal: number = 0;
                let depotsNotRemainingUnitsTotal: number = 0;
                let depotsNotActiveTotal: number = 0;
                let depotsWithoutPriceTotal: number = 0;
                let depotsWithDiscountTotal: number = 0;

                storeDetails.store_depots?.forEach((storeDepot: storeDepotsWithAny) => {
                    depotsRemainingUnitsTotal += storeDepot.product_remaining_units!
                    if (!storeDepot.product_remaining_units) depotsNotRemainingUnitsTotal++
                    if (!storeDepot.is_active) depotsNotActiveTotal++
                    if (!storeDepot.sell_price || storeDepot.sell_price.toString() === "0") depotsWithoutPriceTotal++
                    if (storeDepot.price_discount_percentage || storeDepot.price_discount_quantity) depotsWithDiscountTotal++
                })

                setStoreDepotsStats({
                    depotsTotal,
                    depotsRemainingUnitsTotal,
                    depotsNotRemainingUnitsTotal,
                    depotsNotActiveTotal,
                    depotsWithoutPriceTotal,
                    depotsWithDiscountTotal,
                })
            }

            if (storeTodaySellsDetails) {
                let sellsTotal: number = 0;
                let sellsAmountTotal: number = 0;
                let sellerProfitTotal: number = 0;
                let sellsUnitsReturnedTotal: number = 0;

                let normalSellsTotal: number = 0;
                let normalSellsDifferentProductsTotal: number = 0;
                let normalSellsProductsQuantity: number = 0;
                let normalSellsAmountTotal: number = 0;
                let normalSellerProfitTotal: number = 0;
                let normalSellsUnitsReturnedTotal: number = 0;

                let reservationSellsTotal: number = 0;
                let reservationSellsAmountTotal: number = 0;
                let reservationSellerProfitTotal: number = 0;
                let reservationSellsUnitsReturnedTotal: number = 0;

                let sellsDepotsIdAndSellState: { [key: number]: boolean; } = {};

                storeTodaySellsDetails.forEach((sells: storeSellsDetailsProps) => {
                    let sellProfitQuantity: number = 0;

                    //venta a través de reservación
                    if (storeDetails.online_reservation && sells.reservations) {
                        reservationSellsTotal++
                        sells.reservations.reservation_products.forEach(reservationProductItem => {
                            if (!sellsDepotsIdAndSellState[reservationProductItem.store_depots.depot_id!]) {
                                sellsDepotsIdAndSellState[reservationProductItem.store_depots.depot_id!] = true;
                            }

                            sellProfitQuantity += reservationProductItem.store_depots.seller_profit_quantity
                                ? reservationProductItem.store_depots.seller_profit_quantity * reservationProductItem.units_quantity
                                : reservationProductItem.store_depots.seller_profit_percentage! * reservationProductItem.price / 100;
                        });
                        reservationSellsAmountTotal += sells.total_price!;
                        for (const sell_product of sells.sell_products) {
                            reservationSellsUnitsReturnedTotal += sell_product.units_returned_quantity!;
                        }
                        reservationSellerProfitTotal += sellProfitQuantity;
                    } else {
                        normalSellsTotal++;
                        sells.sell_products.forEach(sellProductItem => {
                            if (!sellsDepotsIdAndSellState[sellProductItem.store_depots.depot_id!]) {
                                normalSellsDifferentProductsTotal++;
                                sellsDepotsIdAndSellState[sellProductItem.store_depots.depot_id!] = true;
                            }
                            normalSellsProductsQuantity += sellProductItem.units_quantity;

                            sellProfitQuantity += sellProductItem.store_depots.seller_profit_quantity
                                ? sellProductItem.store_depots.seller_profit_quantity * sellProductItem.units_quantity
                                : sellProductItem.store_depots.seller_profit_percentage! * sellProductItem.price / 100;
                        });
                        normalSellsAmountTotal += sells.total_price!;
                        for (const sell_product of sells.sell_products) {
                            reservationSellsUnitsReturnedTotal += sell_product.units_returned_quantity!;
                        }
                        normalSellerProfitTotal += sellProfitQuantity;
                    }
                })
                sellsTotal = normalSellsTotal + reservationSellsTotal;
                sellsAmountTotal = normalSellsAmountTotal + reservationSellsAmountTotal;
                sellerProfitTotal = normalSellerProfitTotal + reservationSellerProfitTotal;
                sellsUnitsReturnedTotal = normalSellsUnitsReturnedTotal + reservationSellsUnitsReturnedTotal;

                setTodaySells(storeTodaySellsDetails);
                setTodaySellsStats({
                    sellsTotal,
                    sellsAmountTotal,
                    sellerProfitTotal,
                    sellsUnitsReturnedTotal,
                    normalSellsTotal,
                    normalSellsDifferentProductsTotal,
                    normalSellsProductsQuantity,
                    normalSellsAmountTotal,
                    normalSellsUnitsReturnedTotal,
                    normalSellerProfitTotal,
                    reservationSellsTotal,
                    reservationSellsAmountTotal,
                    reservationSellsUnitsReturnedTotal,
                    reservationSellerProfitTotal,
                });
            }

            if (storeTodayTransferDetails) {
                const { fromWarehouse, toWarehouse } = getDataTransferWarehouseAndStore(storeTodayTransferDetails.warehouseAndStore)
                const { fromStore, toStore } = getDataTransferStore(storeTodayTransferDetails.store)

                const newTodayTransfers = {
                    fromWarehouse,
                    toWarehouse,
                    fromStore,
                    toStore,
                    totalTransfers: fromWarehouse.transfers + toWarehouse.transfers + fromStore.transfers + toStore.transfers,
                    totalProducts: fromWarehouse.products + toWarehouse.products + fromStore.products + toStore.products,
                    totalUnits: fromWarehouse.units + toWarehouse.units + fromStore.units + toStore.units
                }

                setTodayTransfers(newTodayTransfers)
            }

            if (storeTodaySellsReceivable) {
                setTodaySellsReceivable(storeTodaySellsReceivable);
            }
        }

        if (sellerStoreId && userId) {
            loadStatsData();
        }
    }, [sellerStoreId, userId]);

    // modal today sells details
    const [isModalSellsOpen, setIsModalSellsOpen] = useState<boolean>(false);
    const toggleModalSellsOpen = () => {
        if (todaySells?.length! > 0) {
            setIsModalSellsOpen(!isModalSellsOpen)
        } else {
            notifyWarning("La tienda no posee ventas registradas hoy")
        }
    };

    // modal today sells receivable details
    const [isModalSellsReceivableOpen, setIsModalSellsReceivableOpen] = useState<boolean>(false);
    const toggleModalSellsReceivableOpen = () => {
        if (todaySellsReceivable?.length! > 0) {
            setIsModalSellsReceivableOpen(!isModalSellsReceivableOpen)
        } else {
            notifyWarning("La tienda no posee ventas por cobrar registradas hoy")
        }
    };

    // modal today transfers details
    const [todayTransfersDetails, setTodayTransfersDetails] = useState<todayTransferDetails | null>(null)
    const [isModalTransfersOpen, setIsModalTransfersOpen] = useState<boolean>(false);

    const openModalTransfersDetails = async () => {

        if (todayTransfers?.totalTransfers) {
            if (!todayTransfersDetails) {
                const data = await stores.getTodayTransfersDetails(sellerStoreId);
                if (data) setTodayTransfersDetails(data);
            }

            return setIsModalTransfersOpen(true);
        }

        return notifySuccess("La tienda no posee transferencias registradas hoy");
    };

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={() => router.push("/inventory")}>
                        <ArrowLeft fontSize={"large"} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                        }}
                    >
                        {storeDetails?.name}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const [autoOpenTime, setAutoOpenTime] = useState<boolean>(true);
    useEffect(() => {
        if (storeDetails) {
            setAutoOpenTime(storeDetails?.auto_open_time ?? false)
        }
    }, [storeDetails])

    const handleToggleAutoOpen = async () => {
        //change auto open time
        const updatedStore = await stores.changeAutoOpenTime(sellerStoreId);

        let storeData = { ...storeDetails! }
        storeData.auto_open_time = updatedStore.auto_open_time;

        setStoreDetails(storeData);

        if (updatedStore.auto_open_time) {
            notifySuccess("La tienda abre automáticamente en los horarios establecidos");
        } else {
            notifyWarning("La tienda permanecerá cerrada hasta que no vuelva a cambiar esta opción");
        }
    }

    const [autoReservationTime, setAutoReservationTime] = useState(true);
    useEffect(() => {
        if (storeDetails) {
            setAutoReservationTime(storeDetails?.auto_reservation_time ?? false);
        }
    }, [storeDetails]);

    const handleToggleAutoReservation = async () => {
        //change auto reservation time
        const updatedStore = await stores.changeAutoReservationTime(sellerStoreId);

        let storeData = { ...storeDetails! }
        storeData.auto_reservation_time = updatedStore.auto_reservation_time;

        setStoreDetails(storeData);

        if (updatedStore.auto_reservation_time) {
            notifySuccess("La tienda recibe reservaciones automáticamente en los horarios establecidos");
        } else {
            notifyWarning("La tienda permanecerá sin recibir reservaciones hasta que no vuelva a cambiar esta opción");
        }
    }

    const checkOpenCondition = () => {
        if (!storeDetails?.auto_open_time) return false;

        const openDays = storeDetails?.store_open_days!

        const todayWorkIndex = openDays.findIndex(openItem => openItem.week_day_number === dayjs().get("day"));
        const todayIsWorkDay = todayWorkIndex > -1;

        if (!todayIsWorkDay) return false;

        const openTime = dayjs(openDays[todayWorkIndex].day_start_time);
        const closeTime = dayjs(openDays[todayWorkIndex].day_end_time);
        const now = dayjs();

        if (openTime.hour() <= now.hour() && now.hour() <= closeTime.hour()) {
            if (openTime.hour() === now.hour() && openTime.minute() > now.minute()) return false;

            return !(closeTime.hour() === now.hour() && closeTime.minute() < now.minute());
        }

        return false;
    }

    const checkOpenReservationCondition = () => {
        if (!storeDetails?.auto_reservation_time) return false;

        const openDays = storeDetails?.store_reservation_days!;

        const todayWorkIndex = openDays.findIndex(openItem => openItem.week_day_number === dayjs().get("day"));
        const todayIsWorkDay = todayWorkIndex > -1;

        if (!todayIsWorkDay) return false;

        const openTime = dayjs(openDays[todayWorkIndex].day_start_time);
        const closeTime = dayjs(openDays[todayWorkIndex].day_end_time);
        const now = dayjs();

        if (openTime.hour() <= now.hour() && now.hour() <= closeTime.hour()) {
            if (openTime.hour() === now.hour() && openTime.minute() > now.minute()) return false;

            return !(closeTime.hour() === now.hour() && closeTime.minute() < now.minute());
        }

        return false;
    }

    const [displayAutoOpenSection, setDisplayAutoOpenSection] = useState<boolean>(false);
    const [displayAutoReservationSection, setDisplayAutoReservationSection] = useState<boolean>(false);

    const StoreProducts = () => {
        return (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    <Link href={`/inventory/seller/store/${sellerStoreId}/product`}>
                        Productos
                    </Link>
                </Typography>
                {
                    storeDepotsStats && (
                        <Grid container rowSpacing={2} mt={"8px"}>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Productos:
                                </Grid>
                                <Grid item xs={true}>
                                    {storeDepotsStats.depotsTotal} ({storeDepotsStats.depotsRemainingUnitsTotal} total de unidades)
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Productos agotados:
                                </Grid>
                                <Grid item xs={true}>
                                    {storeDepotsStats.depotsNotRemainingUnitsTotal}
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Productos inactivos:
                                </Grid>
                                <Grid item xs={true}>
                                    {storeDepotsStats.depotsNotActiveTotal}
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Productos sin precio:
                                </Grid>
                                <Grid item xs={true}>
                                    {storeDepotsStats.depotsWithoutPriceTotal}
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Productos con descuento:
                                </Grid>
                                <Grid item xs={true}>
                                    {storeDepotsStats.depotsWithDiscountTotal}
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }
            </Card>
        )
    }

    const StoreReservation = () => {
        return (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{ overflowX: "auto", flexWrap: "nowrap", fontSize: "18px" }}>
                    <Link href={`/inventory/seller/store/${sellerStoreId}/reservation`}>
                        Reservaciones
                    </Link>
                </Typography>
                {
                    storeDepotsStats && (
                        <Grid container rowSpacing={2} mt={"8px"}>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Pendientes:
                                </Grid>
                                <Grid item xs={true}>
                                    x (x de hoy)
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Aceptadas hoy:
                                </Grid>
                                <Grid item xs={true}>
                                    x
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Canceladas hoy:
                                </Grid>
                                <Grid item xs={true}>
                                    x
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Vendidas hoy:
                                </Grid>
                                <Grid item xs={true}>
                                    x
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }

            </Card>
        )
    }

    const SellsModule = () => {
        return (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Grid container columnSpacing={2} justifyContent={"space-between"}>
                    <Grid item xs={'auto'}>
                        <Typography variant="h6" onClick={toggleModalSellsOpen} sx={{ color: "blue", cursor: "pointer", fontSize: "18px" }}>
                            Ventas hoy
                        </Typography>
                    </Grid>
                    <Grid item container xs={'auto'} mr={"20px"} />
                    <Grid item container xs={'auto'}>
                        <IconButton size="small" onClick={() => { router.push(`/inventory/seller/store/${params.sellerStoreId}/sellsHistory/`) }} >
                            <Schedule color="primary" />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid container rowSpacing={1} mt={"5px"}>
                    <Grid container item spacing={1} xs={12} alignItems={"center"}>
                        <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                            <ChevronRightOutlined fontSize={"small"} />
                            Total de ventas:
                        </Grid>
                        <Grid item xs={true}>{todaySellsStats?.sellsTotal}</Grid>
                    </Grid>
                    <Grid container item spacing={1} xs={12} alignItems={"center"}>
                        <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                            <ChevronRightOutlined fontSize={"small"} />
                            Recaudado
                        </Grid>
                        <Grid container item xs={true}>
                            <Grid item xs={12}>
                                Total: ${todaySellsStats?.sellsAmountTotal}
                            </Grid>
                            <Grid item xs={12}>
                                Dueño: ${numberFormat(`${todaySellsStats?.sellsAmountTotal! - todaySellsStats?.sellerProfitTotal!}`)}
                            </Grid>
                            <Grid item xs={12}>
                                Vendedor: ${numberFormat(`${todaySellsStats?.sellerProfitTotal}`)}
                            </Grid>
                        </Grid>
                    </Grid>
                    {todaySellsStats?.sellsUnitsReturnedTotal! > 0 &&
                        <Grid container item spacing={1} xs={12} alignItems={"center"}>
                            <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                                <ChevronRightOutlined fontSize={"small"} />
                                Productos devueltos:
                            </Grid>
                            <Grid item xs={true} >{todaySellsStats?.sellsUnitsReturnedTotal}</Grid>
                        </Grid>
                    }
                    {/* Presenciales */}
                    <Grid container rowSpacing={1} marginTop={"2px"}>
                        {storeDetails?.online_reservation &&
                            <>
                                <Grid item xs={12}><Divider orientation="horizontal" variant="fullWidth" /></Grid>
                                <Grid sx={{ fontWeight: 600, mb: "5px", mt: "10px" }}>Presenciales:</Grid>
                                <Grid container item spacing={1} xs={12} alignItems={"center"}>
                                    <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Total:
                                    </Grid>
                                    <Grid item xs={true}>{todaySellsStats?.normalSellsTotal}</Grid>
                                </Grid>
                                <Grid container item spacing={1} xs={12} alignItems={"center"}>
                                    <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Productos:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {todaySellsStats?.normalSellsDifferentProductsTotal} {`(${todaySellsStats?.normalSellsProductsQuantity} unidades totales)`}
                                    </Grid>
                                </Grid>
                                <Grid container item spacing={1} xs={12} alignItems={"center"}>
                                    <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Recaudado
                                    </Grid>
                                    <Grid container item xs={true}>
                                        <Grid item xs={12}>
                                            Total: ${todaySellsStats?.normalSellsAmountTotal}
                                        </Grid>
                                        <Grid item xs={12}>
                                            Dueño: ${numberFormat(`${todaySellsStats?.normalSellsAmountTotal! - todaySellsStats?.normalSellerProfitTotal!}`)}
                                        </Grid>
                                        <Grid item xs={12}>
                                            Vendedor: ${numberFormat(`${todaySellsStats?.normalSellerProfitTotal}`)}
                                        </Grid>
                                    </Grid>
                                </Grid>
                                {todaySellsStats?.normalSellsUnitsReturnedTotal! > 0 &&
                                    <Grid container item spacing={1} xs={12} alignItems={"center"}>
                                        <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                                            <ChevronRightOutlined fontSize={"small"} />
                                            Productos devueltos:
                                        </Grid>
                                        <Grid item xs={true}>{todaySellsStats?.normalSellsUnitsReturnedTotal}</Grid>
                                    </Grid>
                                }
                            </>
                        }
                    </Grid>
                    {/* Por reservaciones */}
                    {storeDetails?.online_reservation &&
                        <Grid container rowSpacing={1} mt={"1px"}>
                            <Grid item xs={12}><Divider orientation="horizontal" variant="fullWidth" /></Grid>
                            <Grid sx={{ fontWeight: 600, mt: "5px" }}>Por reservaciones:</Grid>
                            <Grid container item spacing={1} xs={12} alignItems={"center"}>
                                <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Total:
                                </Grid>
                                <Grid item xs={true}>{todaySellsStats?.reservationSellsTotal}</Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12} alignItems={"center"}>
                                <Grid item xs={"auto"} sx={{ display: "flex", alignItems: "center" }}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    Recaudado
                                </Grid>
                                <Grid container item xs={true}>
                                    <Grid item xs={12}>
                                        Total: ${todaySellsStats?.reservationSellsAmountTotal}
                                    </Grid>
                                    <Grid item xs={12}>
                                        Dueño: ${numberFormat(`${todaySellsStats?.reservationSellsAmountTotal! - todaySellsStats?.reservationSellerProfitTotal!}`)}
                                    </Grid>
                                    <Grid item xs={12}>
                                        Vendedor: ${numberFormat(`${todaySellsStats?.reservationSellerProfitTotal}`)}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    }
                </Grid>
            </Card >
        )
    }

    const TodayTransfers = () => {
        const handleTransfer = (sent: boolean) => {
            router.push(`/inventory/seller/store/${params.sellerStoreId}/transferMailbox?sent=${sent}`)
        }
        return (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Grid container columnSpacing={2} justifyContent={"space-between"}>
                    <Grid item xs={'auto'}>
                        <Typography variant="h6" onClick={openModalTransfersDetails} sx={{ color: "blue", cursor: "pointer", fontSize: "18px" }}>
                            Transferencias hoy
                        </Typography>
                    </Grid>
                    <Grid item container xs={'auto'}>
                        <IconButton size="small" onClick={() => handleTransfer(false)}>
                            <Mail color="primary" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleTransfer(true)} sx={{ ml: "5px" }}>
                            <ForwardToInbox color="secondary" />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid container rowSpacing={2} mt={"8px"}>
                    <Grid container item xs={12} alignItems={"center"}>
                        <ChevronRightOutlined fontSize={"small"} />
                        Total de transferencias: {todayTransfers?.totalTransfers}
                    </Grid>
                    {
                        todayTransfers?.totalTransfers! > 0 && (
                            <>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                        Recibidas
                                    </Grid>
                                    <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Desde almacén: {todayTransfers?.fromWarehouse.transfers}
                                    </Grid>
                                    <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Desde tienda: {todayTransfers?.fromStore.transfers}
                                    </Grid>
                                </Grid>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                        Enviadas
                                    </Grid>
                                    <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Hacia almacén: {todayTransfers?.toWarehouse.transfers}
                                    </Grid>
                                    <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Hacia tienda: {todayTransfers?.toStore.transfers}
                                    </Grid>
                                </Grid>
                            </>
                        )
                    }
                </Grid>
            </Card>
        )
    }

    const SalesReceivableModule = () => {
        return (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Grid container columnSpacing={2} justifyContent={"space-between"}>
                    <Grid item xs={'auto'}>
                        <Typography variant="h6" onClick={toggleModalSellsReceivableOpen} sx={{ color: "blue", cursor: "pointer", fontSize: "18px" }}>
                            Ventas por cobrar
                        </Typography>
                    </Grid>
                    <Grid item container xs={'auto'} mr={"20px"} />
                    <Grid item container xs={'auto'}>
                        <IconButton size="small" onClick={() => { router.push(`/inventory/seller/store/${params.sellerStoreId}/sellsReceivableHistory/`) }} >
                            <Schedule color="primary" />
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid container rowSpacing={2} mt={"8px"}>
                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={12} sx={{ fontWeight: 600 }}>
                            Hoy
                        </Grid>

                        <Grid item xs={12} display={"flex"} alignItems={"center"}>
                            <ChevronRightOutlined fontSize={"small"} />
                            Creadas: {todaySellsReceivable?.length!}
                        </Grid>

                        <Grid item xs={12} display={"flex"} alignItems={"center"}>
                            <ChevronRightOutlined fontSize={"small"} />
                            Pagadas: {todaySellsReceivable?.filter(sell => sell.status === "COBRADA").length!}
                        </Grid>
                    </Grid>

                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={12} sx={{ fontWeight: 600 }}>
                            General
                        </Grid>

                        <Grid item xs={12} display={"flex"} alignItems={"center"}>
                            <ChevronRightOutlined fontSize={"small"} />
                            Total pendientes: {todaySellsReceivable?.filter(sell => sell.status === "PENDIENTE").length!}
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        )
    }


    const StoreCollections = () => {
        return (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant="h6" sx={{ color: "blue", cursor: "pointer", fontSize: "18px" }}>
                    Colecciones
                </Typography>

                <Grid container rowSpacing={2} mt={"8px"}>
                    <Grid container item spacing={1} xs={12}>
                        <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                            <ChevronRightOutlined fontSize={"small"} />
                            Colecciones:
                        </Grid>
                        <Grid item xs={true}>
                            - (con xx productos)
                        </Grid>
                    </Grid>
                </Grid>
            </Card>
        )
    }


    const StoreHours = () => (
        <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
            <Grid container rowSpacing={2}>
                <Grid item xs={12} sx={{ fontWeight: 600 }}>
                    Horarios de apertura:
                    <Switch checked={autoOpenTime} onChange={handleToggleAutoOpen} color={autoOpenTime ? "success" : "warning"} />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={
                        autoOpenTime ?
                            {
                                border: "2px solid",
                                display: "inline-flex",
                                padding: "3px",
                                borderRadius: "4px",
                                borderColor: "lightgreen",
                                alignItems: "center",
                            } : {
                                border: "2px solid",
                                display: "inline-flex",
                                padding: "3px",
                                borderRadius: "4px",
                                borderColor: "orangered",
                                alignItems: "center",
                            }
                    }>
                        <InfoOutlined color={autoOpenTime ? "success" : "error"} sx={{ mr: "3px" }} />
                        {autoOpenTime
                            ? "Abriendo en los horarios establecidos"
                            : "La tienda permanecerá siempre cerrada"
                        }
                    </Box>
                </Grid>
                <Grid item xs={12} container rowSpacing={1}>
                    <Grid container item xs={12} alignItems={"center"}>
                        Ver horarios
                        <IconButton
                            size={"small"}
                            sx={{ m: "3px" }}
                            onClick={() => setDisplayAutoOpenSection(!displayAutoOpenSection)}
                        >
                            {displayAutoOpenSection ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                        </IconButton>

                    </Grid>

                    {
                        displayAutoOpenSection && (
                            <>
                                {
                                    storeDetails?.store_open_days?.length ? (
                                        storeDetails.store_open_days.map(openItem => (
                                            <Grid container item spacing={1} xs={12} key={openItem.id}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                                    <ChevronRightOutlined fontSize={"small"} />
                                                    {daysMap[openItem.week_day_number]}:
                                                </Grid>
                                                <Grid item xs={true}>
                                                    De {openItem?.day_start_time ? dayjs(openItem.day_start_time).format("hh:mm A") : "-"} a {openItem?.day_end_time ? dayjs(openItem.day_end_time).format("hh:mm A") : "-"}
                                                </Grid>
                                            </Grid>
                                        ))
                                    ) : "no especificado"
                                }
                            </>
                        )
                    }
                </Grid>
            </Grid>
        </Card>
    )

    const ReservationHours = () => (
        <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
            <Grid container rowSpacing={2}>
                <Grid item xs={12} sx={{ fontWeight: 600 }}>
                    Horarios de reservaciones:
                    <Switch checked={autoReservationTime} onChange={handleToggleAutoReservation} color={autoReservationTime ? "success" : "warning"} />
                </Grid>
                <Grid item xs={12}>
                    <Box sx={
                        autoReservationTime ?
                            {
                                border: "2px solid",
                                display: "inline-flex",
                                padding: "3px",
                                borderRadius: "4px",
                                borderColor: "lightgreen",
                                alignItems: "center",
                            } : {
                                border: "2px solid",
                                display: "inline-flex",
                                padding: "3px",
                                borderRadius: "4px",
                                borderColor: "orangered",
                                alignItems: "center",
                            }
                    }>
                        <InfoOutlined color={autoReservationTime ? "success" : "error"} sx={{ mr: "3px" }} />
                        {autoReservationTime
                            ? "Recibiendo reservaciones en los horarios establecidos"
                            : "No se recibirán reservaciones"
                        }
                    </Box>
                </Grid>
                <Grid item xs={12} container rowSpacing={1}>
                    <Grid container item xs={12} alignItems={"center"}>
                        Ver horarios
                        <IconButton
                            size={"small"}
                            sx={{ m: "3px" }}
                            onClick={() => setDisplayAutoReservationSection(!displayAutoReservationSection)}
                        >
                            {displayAutoReservationSection ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                        </IconButton>

                    </Grid>

                    {
                        displayAutoReservationSection && (
                            <>
                                {
                                    storeDetails?.store_reservation_days?.length ? (
                                        storeDetails.store_reservation_days.map(reservationItem => (
                                            <Grid container item spacing={1} xs={12} key={reservationItem.id}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                                    <ChevronRightOutlined fontSize={"small"} />
                                                    {daysMap[reservationItem.week_day_number]}:
                                                </Grid>
                                                <Grid item xs={true}>
                                                    De {reservationItem?.day_start_time ? dayjs(reservationItem.day_start_time).format("hh:mm A") : "-"} a {reservationItem?.day_end_time ? dayjs(reservationItem.day_end_time).format("hh:mm A") : "-"}
                                                </Grid>
                                            </Grid>
                                        ))
                                    ) : "no especificado"
                                }
                            </>
                        )
                    }
                </Grid>
            </Grid>
        </Card>
    )

    return (
        <Card variant={"outlined"}>
            <CustomToolbar />

            {todaySells && <ModalSellsToday
                dialogTitle="Ventas hoy"
                isOpen={isModalSellsOpen}
                setIsOpen={setIsModalSellsOpen}
                todaySellsData={todaySells!}
            />}
            {todaySellsReceivable && <ModalSellsReceivableToday
                dialogTitle="Ventas por cobrar hoy"
                isOpen={isModalSellsReceivableOpen}
                setIsOpen={setIsModalSellsReceivableOpen}
                todaySellsReceivableData={todaySellsReceivable!}
            />}

            <ModalTransfersToday
                isOpen={isModalTransfersOpen}
                setIsOpen={setIsModalTransfersOpen}
                transfersData={todayTransfersDetails!}
                storeId={sellerStoreId}
            />

            {
                storeDetails && (
                    <CardContent>
                        <Grid container item spacing={2}>
                            <Grid container item xs={12} rowSpacing={1}>
                                <Grid container item xs={12} justifyContent={"center"}>
                                    Ahora mismo:
                                </Grid>

                                <Grid container item xs={12} justifyContent={"center"}>
                                    {
                                        checkOpenCondition() ? (
                                            <Chip
                                                size={"small"}
                                                label={"Abierto"}
                                                color={"success"}
                                                sx={{ ml: "10px" }}
                                            />
                                        ) : (
                                            <Chip
                                                size={"small"}
                                                label={"Cerrado"}
                                                color={"error"}
                                                sx={{ ml: "10px" }}
                                            />
                                        )
                                    }

                                    {
                                        storeDetails.online_reservation && (
                                            <>
                                                {
                                                    checkOpenReservationCondition() ? (
                                                        <Chip
                                                            size={"small"}
                                                            label={"Aceptando Reservaciones"}
                                                            color={"success"}
                                                            sx={{ ml: "10px" }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            size={"small"}
                                                            label={"Reservaciones No Aceptadas"}
                                                            color={"error"}
                                                            sx={{ ml: "10px" }}
                                                        />
                                                    )
                                                }
                                            </>
                                        )
                                    }
                                </Grid>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <StoreProducts />
                            </Grid>

                            {/*{
                                storeDetails.online_reservation && (
                                    <Grid item xs={12} md={6}>
                                        <StoreReservation />
                                    </Grid>
                                )
                            }*/}

                            <Grid item xs={12} md={6}>
                                <SellsModule />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TodayTransfers />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <SalesReceivableModule />
                            </Grid>

                            {/*<Grid item xs={12} md={6}>
                                <StoreCollections />
                            </Grid>*/}

                            <Grid item xs={12} md={6}>
                                <StoreHours />
                            </Grid>

                            {/*{
                                storeDetails.online_reservation && (
                                    <Grid item xs={12} md={6}>
                                        <ReservationHours />
                                    </Grid>
                                )
                            }*/}
                        </Grid>
                    </CardContent>
                )
            }
        </Card>
    )
}

export default StoreMain