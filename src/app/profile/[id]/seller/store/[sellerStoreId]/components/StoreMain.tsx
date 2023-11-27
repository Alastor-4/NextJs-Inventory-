// @ts-nocheck
"use client"

import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    IconButton,
    Switch,
    Toolbar,
    Typography
} from "@mui/material";
import {
    ArrowLeft,
    ChevronRightOutlined,
    ExpandLessOutlined,
    ExpandMoreOutlined,
    InfoOutlined
} from "@mui/icons-material"
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import stores from "@/app/profile/[id]/seller/store/[sellerStoreId]/requests/sellerStore";
import Link from "next/link";
import {daysMap, numberFormat} from "@/utils/generalFunctions";

dayjs.extend(isBetween)

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoreMain() {
    const [storeDetails, setStoreDetails] = React.useState(null)
    const [storeDepotsStats, setStoreDepotsStats] = React.useState(null)
    const [productSells, setProductSells] = React.useState(null)
    const [productSellsStats, setProductSellsStats] = React.useState(null)

    const params = useParams()
    const router = useRouter()
    
    const userId = params.id
    const sellerStoreId = params.sellerStoreId

    //get initial storeDetails
    React.useEffect(() => {
        fetcher(`/profile/${userId}/seller/store/${sellerStoreId}/api`)
            .then((data) => {
                setStoreDetails(data)

                const depotsTotal = data.store_depots.length
                let depotsRemainingUnitsTotal = 0
                let depotsNotRemainingUnitsTotal = 0
                let depotsNotActiveTotal = 0
                let depotsWithoutPriceTotal = 0
                let depotsWithDiscountTotal = 0

                data.store_depots.forEach(item => {
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
            })

        fetcher(`/profile/${userId}/seller/store/${sellerStoreId}/sellsApi`)
            .then((data) => {
                setProductSells(data)
                const sellsTotal = data.length
                let sellsDifferentProductsTotal = 0
                let sellsUnitsTotal = 0
                let sellsAmountTotal = 0
                let sellsUnitsReturnedTotal = 0
                let sellerProfitTotal = 0

                let seeDepotsId = {}

                data.forEach(item => {
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
            })

    }, [sellerStoreId, userId])

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <IconButton color={"inherit"} sx={{mr: "10px"}} onClick={() => router.back()}>
                        <ArrowLeft fontSize={"large"}/>
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

    const [autoOpenTime, setAutoOpenTime] = React.useState(true)
    React.useEffect(() => {
        if (storeDetails) {
            setAutoOpenTime(storeDetails?.auto_open_time ?? false)
        }
    }, [storeDetails])

    async function handleToggleAutoOpen() {
        //change auto open time
        const updatedStore = await stores.changeAutoOpenTime(userId, sellerStoreId)

        let storeData = {...storeDetails}
        storeData.auto_open_time = updatedStore.auto_open_time

        setStoreDetails(storeData)
    }

    const [autoReservationTime, setAutoReservationTime] = React.useState(true)
    React.useEffect(() => {
        if (storeDetails) {
            setAutoReservationTime(storeDetails?.auto_reservation_time ?? false)
        }
    }, [storeDetails])

    async function handleToggleAutoReservation() {
        //change auto reservation time
        const updatedStore = await stores.changeAutoReservationTime(userId, sellerStoreId)

        let storeData = {...storeDetails}
        storeData.auto_reservation_time = updatedStore.auto_reservation_time

        setStoreDetails(storeData)
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

    const [displayAutoOpenSection, setDisplayAutoOpenSection] = React.useState(false)
    const [displayAutoReservationSection, setDisplayAutoReservationSection] = React.useState(false)

    const StoreProducts = () => {

        return (
            <Card variant={"outlined"}>
                <Link href={`/profile/${userId}/seller/store/${sellerStoreId}/product`}>
                    <CardHeader title={"Productos en tienda"}/>
                </Link>

                <CardContent>
                    {
                        storeDepotsStats && (
                            <Grid container rowSpacing={2}>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Productos:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {storeDepotsStats.depotsTotal} ({storeDepotsStats.depotsRemainingUnitsTotal} total de unidades)
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Productos agotados:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {storeDepotsStats.depotsNotRemainingUnitsTotal}
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Productos inactivos:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {storeDepotsStats.depotsNotActiveTotal}
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Productos sin precio:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {storeDepotsStats.depotsWithoutPriceTotal}
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
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
                <Link href={`/profile/${userId}/seller/store/${sellerStoreId}/reservation`}>
                    <CardHeader title={"Reservaciones"}/>
                </Link>

                <CardContent>
                    {
                        storeDepotsStats && (
                            <Grid container rowSpacing={2}>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Pendientes:
                                    </Grid>
                                    <Grid item xs={true}>
                                        x (x de hoy)
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Aceptadas hoy:
                                    </Grid>
                                    <Grid item xs={true}>
                                        x
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Canceladas hoy:
                                    </Grid>
                                    <Grid item xs={true}>
                                        x
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
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


    const TodaySells = () => {

        return (
            <Card variant={"outlined"}>
                <CardHeader title={"Ventas de hoy"}/>

                <CardContent>
                    {
                        productSellsStats && (
                            <Grid container rowSpacing={2}>
                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Ventas:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {productSellsStats.sellsTotal} ({productSellsStats.sellsUnitsTotal} unidades total) ({productSellsStats.sellsDifferentProductsTotal} productos diferentes)
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Productos devueltos:
                                    </Grid>
                                    <Grid item xs={true}>
                                        {productSellsStats.sellsUnitsReturnedTotal}
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
                                        Total vendido:
                                    </Grid>
                                    <Grid item xs={true}>
                                        $ {numberFormat(productSellsStats.sellsAmountTotal)}
                                    </Grid>
                                </Grid>

                                <Grid container item spacing={1} xs={12}>
                                    <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                        <ChevronRightOutlined fontSize={"small"}/>
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

        return (
            <Card variant={"outlined"}>
                <CardHeader title={"Transferencias de hoy"}/>

                <CardContent>
                    contenido aqui
                </CardContent>
            </Card>
        )
    }

    const StoreCollections = () => {

        return (
            <Card variant={"outlined"}>
                <CardHeader title={"Colecciones"}/>

                <CardContent>
                    <Grid container rowSpacing={2}>
                        <Grid container item spacing={1} xs={12}>
                            <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                <ChevronRightOutlined fontSize={"small"}/>
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
        <Card variant={"outlined"} sx={{padding: "10px"}}>
            <Grid container rowSpacing={2}>
                <Grid item xs={12} sx={{fontWeight: 600}}>
                    Horarios de apertura:
                    <Switch checked={autoOpenTime} onChange={handleToggleAutoOpen} color={autoOpenTime ? "success" : "warning"}/>
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
                        <InfoOutlined color={autoOpenTime ? "success" : "error"} sx={{mr: "3px"}}/>
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
                            sx={{m: "3px"}}
                            onClick={() => setDisplayAutoOpenSection(!displayAutoOpenSection)}
                        >
                            {displayAutoOpenSection ? <ExpandLessOutlined/> : <ExpandMoreOutlined/>}
                        </IconButton>

                    </Grid>

                    {
                        displayAutoOpenSection && (
                            <>
                                {
                                    storeDetails?.store_open_days?.length ? (
                                        storeDetails.store_open_days.map(openItem => (
                                            <Grid container item spacing={1} xs={12} key={openItem.id}>
                                                <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                                    <ChevronRightOutlined fontSize={"small"}/>
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
        <Card variant={"outlined"} sx={{padding: "10px"}}>
            <Grid container rowSpacing={2}>
                <Grid item xs={12} sx={{fontWeight: 600}}>
                    Horarios de reservaciones:
                    <Switch checked={autoReservationTime} onChange={handleToggleAutoReservation} color={autoReservationTime ? "success" : "warning"}/>
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
                        <InfoOutlined color={autoReservationTime ? "success" : "error"} sx={{mr: "3px"}}/>
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
                            sx={{m: "3px"}}
                            onClick={() => setDisplayAutoReservationSection(!displayAutoReservationSection)}
                        >
                            {displayAutoReservationSection ? <ExpandLessOutlined/> : <ExpandMoreOutlined/>}
                        </IconButton>

                    </Grid>

                    {
                        displayAutoReservationSection && (
                            <>
                                {
                                    storeDetails?.store_reservation_days?.length ? (
                                        storeDetails.store_reservation_days.map(reservationItem => (
                                            <Grid container item spacing={1} xs={12} key={reservationItem.id}>
                                                <Grid item xs={"auto"} sx={{fontWeight: 600, display: "flex", alignItems: "center"}}>
                                                    <ChevronRightOutlined fontSize={"small"}/>
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
            <CustomToolbar/>

            {
                storeDetails && (
                    <CardContent>
                        <Grid container rowSpacing={5}>
                            <Grid container item spacing={3}>
                                <Grid container item xs={12} justifyContent={"center"}>
                                    {storeDetails?.name ?? "-"}
                                </Grid>

                                <Grid container item xs={12} justifyContent={"center"}>
                                    <Box sx={{display: "inline-flex", ml: "10px"}}>
                                        Ahora mismo:
                                        {
                                            checkOpenCondition() ? (
                                                <Chip
                                                    size={"small"}
                                                    label={"Abierto"}
                                                    color={"success"}
                                                    sx={{ml: "10px"}}
                                                />
                                            ) : (
                                                <Chip
                                                    size={"small"}
                                                    label={"Cerrado"}
                                                    color={"error"}
                                                    sx={{ml: "10px"}}
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
                                                                sx={{ml: "10px"}}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                size={"small"}
                                                                label={"Reservaciones No Aceptadas"}
                                                                color={"error"}
                                                                sx={{ml: "10px"}}
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
                                    <StoreProducts/>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TodaySells/>
                                </Grid>

                                {
                                    storeDetails.online_reservation && (
                                        <Grid item xs={12} md={6}>
                                            <StoreReservation/>
                                        </Grid>
                                    )
                                }

                                <Grid item xs={12} md={6}>
                                    <TodayTransfers/>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <StoreCollections/>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <StoreHours/>
                                </Grid>

                                {
                                    storeDetails.online_reservation && (
                                        <Grid item xs={12} md={6}>
                                            <ReservationHours/>
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