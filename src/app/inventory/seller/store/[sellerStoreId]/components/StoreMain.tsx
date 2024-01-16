//@ts-nocheck
"use client"

import {
    AppBar, Box, Button, Card, CardContent, CardHeader,
    Chip, Grid, IconButton, Switch, Toolbar, Typography
} from "@mui/material";
import {
    ArrowLeft, ChevronRightOutlined, ExpandLessOutlined, ExpandMoreOutlined,
    ForwardToInbox, InfoOutlined, Mail, Schedule
} from "@mui/icons-material"
import { daysMap, notifySuccess, notifyWarning, numberFormat } from "@/utils/generalFunctions";
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import { productSellsStatsProps, storeDepotsStatsProps, storeDepotsWithAny, storeSellsDetailsProps, storeWithStoreDepots } from "@/types/interfaces";
import { useParams, useRouter } from "next/navigation";
import ModalSellsToday from "./Modal/ModalSellsToday";
import React, { useEffect, useState } from "react";
import isBetween from "dayjs/plugin/isBetween";
import Link from "next/link";
import dayjs from "dayjs";
import userProfileStyles from "@/assets/styles/userProfileStyles";

dayjs.extend(isBetween);

export default function StoreMain({ userId }: { userId?: number }) {
    const [productSells, setProductSells] = useState(null)

    const [storeDepotsStats, setStoreDepotsStats] = useState<storeDepotsStatsProps | null>(null);
    const [storeDetails, setStoreDetails] = useState<storeWithStoreDepots | null>(null);
    const [todaySellsStats, setTodaySellsStats] = useState<productSellsStatsProps | null>(null);
    const [todaySells, setTodaySells] = useState<storeSellsDetailsProps[] | null>(null);

    const params = useParams();
    const router = useRouter();

    const sellerStoreId = +params.sellerStoreId!;

    //Modal Handlers
    const [isModalSellsOpen, setIsModalSellsOpen] = useState<boolean>(false);
    const toggleModalSellsOpen = () => {
        if (todaySells) setIsModalSellsOpen(!isModalSellsOpen);
    };

    //GET initial store and sellsStats details
    useEffect(() => {
        async function loadStatsData() {
            const storeDetailsPromise: storeWithStoreDepots = await stores.storeDetails(userId, sellerStoreId);
            const storeTodaySellsDetailsPromise: storeSellsDetailsProps[] = await stores.storeSellsDetails(sellerStoreId);

            const [storeDetails, storeTodaySellsDetails] =
                await Promise.all([storeDetailsPromise, storeTodaySellsDetailsPromise]);

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
                    if (storeDepot.sell_price.toString() === "0") depotsWithoutPriceTotal++
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
                const sellsTotal: number = storeTodaySellsDetails.length!
                let sellsDifferentProductsTotal: number = 0;
                let sellsUnitsTotal: number = 0;
                let sellsAmountTotal: number = 0;
                let sellsUnitsReturnedTotal: number = 0;
                let sellerProfitTotal: number = 0;

                let sellsDepotsIdAndSellState: { [key: number]: boolean; } = {};

                storeTodaySellsDetails.forEach((sells: storeSellsDetailsProps) => {
                    let sellProfitQuantity: number = 0;

                    //venta a través de reservación
                    if (sells.reservations) {
                        sells.reservations.reservation_products.forEach(reservationProductItem => {
                            if (!sellsDepotsIdAndSellState[reservationProductItem.store_depots.depot_id!]) {
                                sellsDifferentProductsTotal++;
                                sellsDepotsIdAndSellState[reservationProductItem.store_depots.depot_id!] = true
                            }

                            sellsUnitsTotal += reservationProductItem.units_quantity;

                            sellProfitQuantity += reservationProductItem.store_depots.seller_profit_quantity
                                ? reservationProductItem.store_depots.seller_profit_quantity * reservationProductItem.units_quantity
                                : reservationProductItem.store_depots.seller_profit_percentage! * reservationProductItem.price / 100;
                        })
                    } else {
                        sells.sell_products.forEach(sellProductItem => {
                            if (!sellsDepotsIdAndSellState[sellProductItem.store_depots.depot_id!]) {
                                sellsDifferentProductsTotal++;
                                sellsDepotsIdAndSellState[sellProductItem.store_depots.depot_id!] = true;
                            }

                            sellsUnitsTotal += sellProductItem.units_quantity;

                            sellProfitQuantity += sellProductItem.store_depots.seller_profit_quantity
                                ? sellProductItem.store_depots.seller_profit_quantity * sellProductItem.units_quantity
                                : sellProductItem.store_depots.seller_profit_percentage! * sellProductItem.price / 100;
                        })
                    }

                    sellsAmountTotal += sells.total_price!;
                    sellsUnitsReturnedTotal += sells.units_returned_quantity!;

                    sellerProfitTotal += sellProfitQuantity;
                })
                setTodaySells(storeTodaySellsDetails);
                setTodaySellsStats({
                    sellsTotal,
                    sellsDifferentProductsTotal,
                    sellsUnitsTotal,
                    sellsAmountTotal,
                    sellsUnitsReturnedTotal,
                    sellerProfitTotal,
                });
            }
        }

        if (sellerStoreId && userId) {
            loadStatsData();
        }
    }, [sellerStoreId, userId]);

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={() => router.back()}>
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
                        Mi Tienda
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

    async function handleToggleAutoOpen() {
        //change auto open time
        const updatedStore = await stores.changeAutoOpenTime(sellerStoreId)

        let storeData = { ...storeDetails! }
        storeData.auto_open_time = updatedStore.auto_open_time

        setStoreDetails(storeData)

        if (updatedStore.auto_open_time) {
            notifySuccess("La tienda abre automáticamente en los horarios establecidos")
        } else {
            notifyWarning("La tienda permanecerá cerrada hasta que no vuelva a cambiar esta opción")
        }
    }

    const [autoReservationTime, setAutoReservationTime] = useState(true)
    useEffect(() => {
        if (storeDetails) {
            setAutoReservationTime(storeDetails?.auto_reservation_time ?? false)
        }
    }, [storeDetails])

    async function handleToggleAutoReservation() {
        //change auto reservation time
        const updatedStore = await stores.changeAutoReservationTime(sellerStoreId)

        let storeData = { ...storeDetails }
        storeData.auto_reservation_time = updatedStore.auto_reservation_time

        setStoreDetails(storeData)

        if (updatedStore.auto_reservation_time) {
            notifySuccess("La tienda recibe reservaciones automáticamente en los horarios establecidos")
        } else {
            notifyWarning("La tienda permanecerá sin recibir reservaciones hasta que no vuelva a cambiar esta opción")
        }
    }

    function checkOpenCondition() {
        if (!storeDetails.auto_open_time) return false

        const openDays = storeDetails.store_open_days

        const todayWorkIndex = openDays.findIndex(openItem => openItem.week_day_number === dayjs().get("day"))
        const todayIsWorkDay = todayWorkIndex > -1

        if (!todayIsWorkDay) return false

        const openTime = dayjs(openDays[todayWorkIndex].day_start_time, "HH:mm:ss")
        const closeTime = dayjs(openDays[todayWorkIndex].day_end_time, "HH:mm:ss")
        const now = dayjs(Date(), "HH:mm:ss")

        if (openTime.hour() <= now.hour() && now.hour() <= closeTime.hour()) {
            if (openTime.hour() === now.hour() && openTime.minute() < now.minute()) return false

            return !(closeTime.hour() === now.hour() && closeTime.minute() < now.minute())
        }

        return false
    }

    function checkOpenReservationCondition() {
        if (!storeDetails.auto_reservation_time) return false

        const openDays = storeDetails.store_reservation_days

        const todayWorkIndex = openDays.findIndex(openItem => openItem.week_day_number === dayjs().get("day"))
        const todayIsWorkDay = todayWorkIndex > -1

        if (!todayIsWorkDay) return false

        const openTime = dayjs(openDays[todayWorkIndex].day_start_time, "HH:mm:ss")
        const closeTime = dayjs(openDays[todayWorkIndex].day_end_time, "HH:mm:ss")
        const now = dayjs(Date(), "HH:mm:ss")

        if (openTime.hour() <= now.hour() && now.hour() <= closeTime.hour()) {
            if (openTime.hour() === now.hour() && openTime.minute() < now.minute()) return false

            return !(closeTime.hour() === now.hour() && closeTime.minute() < now.minute())
        }

        return false
    }

    const [displayAutoOpenSection, setDisplayAutoOpenSection] = useState<boolean>(false);
    const [displayAutoReservationSection, setDisplayAutoReservationSection] = useState<boolean>(false);

    const StoreProducts = () => {

        return (
            <Card variant={"outlined"} sx={userProfileStyles.cardButton}>
                <Typography variant={"h6"} sx={{overflowX: "auto", flexWrap: "nowrap", fontSize: "18px"}}>
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
                <Typography variant={"h6"} sx={{overflowX: "auto", flexWrap: "nowrap", fontSize: "18px"}}>
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

                    <Grid item container xs={'auto'} mr={"20px"}>
                        <IconButton size="small" onClick={() => { router.push(`/inventory/seller/store/${params.sellerStoreId}/sellsHistory/`) }} >
                            <Schedule color="primary" />
                        </IconButton>
                    </Grid>
                </Grid>

                {
                    todaySellsStats && (
                        <Grid container rowSpacing={2} mt={"8px"}>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                    Total de ventas:
                                </Grid>
                                <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    {todaySellsStats.sellsTotal} ({todaySellsStats.sellsUnitsTotal} unidades totales) ({todaySellsStats.sellsDifferentProductsTotal} productos diferentes)
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                    Productos devueltos:
                                </Grid>
                                <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    {todaySellsStats.sellsUnitsReturnedTotal}
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                    Total recaudado:
                                </Grid>
                                <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    $ {numberFormat(`${todaySellsStats.sellsAmountTotal}`)}
                                </Grid>
                            </Grid>
                            <Grid container item spacing={1} xs={12}>
                                <Grid item xs={12} sx={{ fontWeight: 600 }}>
                                    Desglose:
                                </Grid>
                                <Grid item xs={12} display={"flex"} alignItems={"center"}>
                                    <ChevronRightOutlined fontSize={"small"} />
                                    $ {numberFormat(`${todaySellsStats.sellsAmountTotal - todaySellsStats.sellerProfitTotal}`)} del dueño | $ {numberFormat(`${todaySellsStats.sellerProfitTotal}`)} del vendedor
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }
            </Card>
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
                        <Typography variant="h6" sx={{ color: "blue", cursor: "pointer", fontSize: "18px" }}>
                            Transferencias hoy
                        </Typography>
                    </Grid>

                    <Grid item container xs={'auto'}>
                        <IconButton size="small" onClick={() => handleTransfer(false)}>
                            <Mail color="primary" />
                        </IconButton>

                        <IconButton size="small" onClick={() => handleTransfer(true)} sx={{ml: "5px"}}>
                            <ForwardToInbox color="primary" />
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid container rowSpacing={2} mt={"8px"}>
                    contenido aqui
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
            <ModalSellsToday
                dialogTitle="Ventas de hoy"
                isOpen={isModalSellsOpen}
                setIsOpen={setIsModalSellsOpen}
                todaySellsData={todaySells!}
            />
            {
                storeDetails && (
                    <CardContent>
                        <Grid container item spacing={2}>
                            <Grid container item xs={12} justifyContent={"center"}>
                                <Typography variant={"h5"}>
                                    {storeDetails?.name ?? "-"}
                                </Typography>
                            </Grid>

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

                            <Grid container item xs={12} justifyContent={"center"}>
                                {storeDetails?.slogan ?? "-"}
                            </Grid>

                            <Grid container item xs={12} justifyContent={"center"}>
                                {storeDetails?.description ?? "-"}
                            </Grid>

                            <Grid container item xs={12} justifyContent={"center"}>
                                {storeDetails?.address ?? "-"}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <StoreProducts />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <SellsModule />
                            </Grid>

                            {
                                storeDetails.online_reservation && (
                                    <Grid item xs={12} md={6}>
                                        <StoreReservation />
                                    </Grid>
                                )
                            }

                            <Grid item xs={12} md={6}>
                                <TodayTransfers />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <StoreCollections />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <StoreHours />
                            </Grid>

                            {
                                storeDetails.online_reservation && (
                                    <Grid item xs={12} md={6}>
                                        <ReservationHours />
                                    </Grid>
                                )
                            }
                        </Grid>
                    </CardContent>
                )
            }
        </Card>
    )
}