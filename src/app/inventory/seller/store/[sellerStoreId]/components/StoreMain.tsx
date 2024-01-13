//@ts-nocheck
"use client"

import {
    AppBar, Box, Button, Card, CardContent, CardHeader,
    Chip, Grid, IconButton, Switch, Toolbar, Typography
} from "@mui/material";
import {
    ArrowLeft, ChevronRightOutlined, ExpandLessOutlined, ExpandMoreOutlined,
    ForwardToInbox, InfoOutlined, Mail
} from "@mui/icons-material"
import { daysMap, notifySuccess, notifyWarning, numberFormat } from "@/utils/generalFunctions";
import stores from "@/app/inventory/seller/store/[sellerStoreId]/requests/sellerStore";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import isBetween from "dayjs/plugin/isBetween";
import Link from "next/link";
import dayjs from "dayjs";
import ModalSellsToday from "./Modal/ModalSellsToday";

dayjs.extend(isBetween);

export default function StoreMain({ userId }) {
    const [storeDetails, setStoreDetails] = useState(null)
    const [storeDepotsStats, setStoreDepotsStats] = useState(null)
    const [productSells, setProductSells] = useState(null)
    const [productSellsStats, setProductSellsStats] = useState(null)

    const params = useParams();
    const router = useRouter();

    const sellerStoreId = params.sellerStoreId;

    //Modal Handlers
    const [isModalSellsOpen, setIsModalSellsOpen] = useState<boolean>(false);
    const toggleModalSellsOpen = () => setIsModalSellsOpen(!isModalSellsOpen);

    //get initial store and sells details and compute stats
    useEffect(() => {
        async function loadStatsData() {
            const p1 = await stores.storeDetails(userId, sellerStoreId)
            const p2 = await stores.storeSellsDetails(sellerStoreId)

            const [storeDetailsResponse, storeSellsResponse] = [p1, p2]
            // const [storeDetailsResponse, storeSellsResponse] = await Promise.all([p1, p2])

            if (storeDetailsResponse) {
                setStoreDetails(storeDetailsResponse)

                const depotsTotal = storeDetailsResponse.store_depots.length
                let depotsRemainingUnitsTotal = 0
                let depotsNotRemainingUnitsTotal = 0
                let depotsNotActiveTotal = 0
                let depotsWithoutPriceTotal = 0
                let depotsWithDiscountTotal = 0

                storeDetailsResponse.store_depots.forEach(item => {
                    depotsRemainingUnitsTotal += item.product_remaining_units
                    if (!item.product_remaining_units) depotsNotRemainingUnitsTotal++
                    if (!item.is_active) depotsNotActiveTotal++
                    if (item.sell_price.toString() === "0") depotsWithoutPriceTotal++
                    if (item.price_discount_percentage || item.price_discount_quantity) depotsWithDiscountTotal++
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

            if (storeSellsResponse) {
                setProductSells(storeSellsResponse)
                const sellsTotal = storeSellsResponse.length
                let sellsDifferentProductsTotal = 0
                let sellsUnitsTotal = 0
                let sellsAmountTotal = 0
                let sellsUnitsReturnedTotal = 0
                let sellerProfitTotal = 0

                let seeDepotsId = {}

                storeSellsResponse.forEach(item => {
                    let sellProfitQuantity = 0

                    //sell from a reservation
                    if (item.reservations) {
                        //loop trough reservation products
                        item.reservations.reservation_products.forEach(reservationProductItem => {
                            if (!seeDepotsId[reservationProductItem.store_depots.depot_id]) {
                                sellsDifferentProductsTotal++
                                seeDepotsId[reservationProductItem.store_depots.depot_id] = true
                            }

                            sellsUnitsTotal += reservationProductItem.units_quantity

                            sellProfitQuantity += reservationProductItem.store_depots.seller_profit_quantity
                                ? reservationProductItem.store_depots.seller_profit_quantity * reservationProductItem.units_quantity
                                : reservationProductItem.store_depots.seller_profit_percentage * reservationProductItem.price / 100
                        })
                    } else {
                        //loop trough sell products
                        item.sell_products.forEach(sellProductItem => {
                            if (!seeDepotsId[sellProductItem.store_depots.depot_id]) {
                                sellsDifferentProductsTotal++
                                seeDepotsId[sellProductItem.store_depots.depot_id] = true
                            }

                            sellsUnitsTotal += sellProductItem.units_quantity

                            sellProfitQuantity += sellProductItem.store_depots.seller_profit_quantity
                                ? sellProductItem.store_depots.seller_profit_quantity * sellProductItem.units_quantity
                                : sellProductItem.store_depots.seller_profit_percentage * sellProductItem.price / 100
                        })
                    }

                    sellsAmountTotal += item.total_price
                    sellsUnitsReturnedTotal += item.units_returned_quantity

                    sellerProfitTotal += sellProfitQuantity
                })

                setProductSellsStats({
                    sellsTotal,
                    sellsDifferentProductsTotal,
                    sellsUnitsTotal,
                    sellsAmountTotal,
                    sellsUnitsReturnedTotal,
                    sellerProfitTotal,
                })
            }
        }

        if (sellerStoreId && userId) {
            loadStatsData()
        }
    }, [sellerStoreId, userId])

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

    const [autoOpenTime, setAutoOpenTime] = useState(true)
    useEffect(() => {
        if (storeDetails) {
            setAutoOpenTime(storeDetails?.auto_open_time ?? false)
        }
    }, [storeDetails])

    async function handleToggleAutoOpen() {
        //change auto open time
        const updatedStore = await stores.changeAutoOpenTime(sellerStoreId)

        let storeData = { ...storeDetails }
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

    const [displayAutoOpenSection, setDisplayAutoOpenSection] = useState(false)
    const [displayAutoReservationSection, setDisplayAutoReservationSection] = useState(false)

    const StoreProducts = () => {

        return (
            <Card variant={"outlined"}>
                <Link href={`/inventory/seller/store/${sellerStoreId}/product`}>
                    <CardHeader title={"Productos en tienda"} />
                </Link>

                <CardContent>
                    {
                        storeDepotsStats && (
                            <Grid container rowSpacing={2}>
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
                </CardContent>
            </Card>
        )
    }

    const StoreReservation = () => {

        return (
            <Card variant={"outlined"}>
                <Link href={`/inventory/seller/store/${sellerStoreId}/reservation`}>
                    <CardHeader title={"Reservaciones"} />
                </Link>

                <CardContent>
                    {
                        storeDepotsStats && (
                            <Grid container rowSpacing={2}>
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
                </CardContent>
            </Card>
        )
    }


    const SellsModule = () => {
        return (
            <Card variant={"outlined"} sx={{ overflow: "visible" }}>
                <CardHeader sx={{ marginBottom: "-20px", marginTop: "-30px" }} title={
                    <Typography display={"flex"} variant="h5" sx={{ bgcolor: "white", px: "3px", width: "73px" }}>
                        Ventas
                    </Typography>
                } />
                <CardContent>
                    <Grid item container justifyContent={"space-between"} marginBottom={"15px"}>
                        <Grid item xs={8}>
                            <Button size="small" variant="outlined" color="primary" onClick={toggleModalSellsOpen}>Detalles de hoy</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button size="small" variant="outlined" color="secondary">Historial</Button>
                        </Grid>
                    </Grid>
                    {
                        productSellsStats && (
                            <Grid container rowSpacing={2}>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Ventas:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {productSellsStats.sellsTotal} ({productSellsStats.sellsUnitsTotal} unidades total) ({productSellsStats.sellsDifferentProductsTotal} productos diferentes)
                                    </Grid>
                                </Grid>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Productos devueltos:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {productSellsStats.sellsUnitsReturnedTotal}
                                    </Grid>
                                </Grid>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Total vendido:
                                    </Grid>
                                    <Grid item xs={true}>
                                        $ {numberFormat(productSellsStats.sellsAmountTotal)}
                                    </Grid>
                                </Grid>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
                                        <ChevronRightOutlined fontSize={"small"} />
                                        Desglose:
                                    </Grid>
                                    <Grid item xs={true}>
                                        $ {numberFormat(productSellsStats.sellsAmountTotal - productSellsStats.sellerProfitTotal)} del dueño | $ {numberFormat(productSellsStats.sellerProfitTotal)} del vendedor
                                    </Grid>
                                </Grid>
                            </Grid>
                        )
                    }
                </CardContent>
            </Card>
        )
    }

    const TodayTransfers = () => {

        const handleTransfer = (sent: boolean) => {
            router.push(`/inventory/seller/store/${params.sellerStoreId}/transferMailbox?sent=${sent}`)

        }

        return (
            <Card variant={"outlined"}>
                <CardHeader title={
                    <Grid container spacing={2}>

                        <Grid item>
                            Transferencias de hoy
                        </Grid>

                        <Grid item container xs={'auto'}>

                            <Grid item>
                                <IconButton size="small" onClick={() => handleTransfer(false)} >
                                    <Mail color="primary" />
                                </IconButton>
                            </Grid>

                            <Grid item >
                                <IconButton size="small" onClick={() => handleTransfer(true)} >
                                    <ForwardToInbox color="primary" />
                                </IconButton>
                            </Grid>

                        </Grid>
                    </Grid>
                } />

                <CardContent>
                    contenido aqui
                </CardContent>
            </Card>
        )
    }

    const StoreCollections = () => {

        return (
            <Card variant={"outlined"}>
                <CardHeader title={"Colecciones"} />

                <CardContent>
                    <Grid container rowSpacing={2}>
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
                </CardContent>
            </Card>
        )
    }


    const StoreHours = () => (
        <Card variant={"outlined"} sx={{ padding: "10px" }}>
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
        <Card variant={"outlined"} sx={{ padding: "10px" }}>
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
            />
            {
                storeDetails && (
                    <CardContent>
                        <Grid container rowSpacing={5}>
                            <Grid container item spacing={3}>
                                <Grid container item xs={12} justifyContent={"center"}>
                                    {storeDetails?.name ?? "-"}
                                </Grid>

                                <Grid container item xs={12} justifyContent={"center"}>
                                    <Box sx={{ display: "inline-flex", ml: "10px" }}>
                                        Ahora mismo:
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
                                    </Box>
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
                        </Grid>
                    </CardContent>
                )
            }
        </Card>
    )
}