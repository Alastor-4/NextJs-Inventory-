"use client"

import React from "react";
import {
    AppBar,
    Box,
    Card,
    CardContent,
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
    DeleteOutline,
    EditOutlined,
    ExpandLessOutlined, ExpandMoreOutlined,
    InfoOutlined
} from "@mui/icons-material"
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import {lightGreen} from "@mui/material/colors";
import stores from "@/app/profile/[id]/seller/store/[sellerStoreId]/requests/stores";

dayjs.extend(isBetween)

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function StoreMain() {
    const [storeDetails, setStoreDetails] = React.useState(null)

    const params = useParams()
    const router = useRouter()
    
    const userId = params.id
    const sellerStoreId = params.sellerStoreId

    //ToDo: use global isLoading
    const isLoading = false

    //get initial storeDetails
    React.useEffect(() => {
        fetcher(`/profile/${userId}/seller/store/${sellerStoreId}/api`).then((data) => setStoreDetails(data))
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

    const daysMap = {
        0: "Domingo",
        1: "Lunes",
        2: "Martes",
        3: "Miércoles",
        4: "Jueves",
        5: "Viernes",
        6: "Sábado",
    }

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
                                        {
                                            checkOpenCondition() ? (
                                                <Chip
                                                    size={"small"}
                                                    label={"Ahora Abierto"}
                                                    color={"success"}
                                                />
                                            ) : (
                                                <Chip
                                                    size={"small"}
                                                    label={"Ahora Cerrado"}
                                                    color={"error"}
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
                                                                label={"Aceptando Reservaciones Ahora"}
                                                                color={"success"}
                                                                sx={{ml: "10px"}}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                size={"small"}
                                                                label={"Reservaciones No Aceptadas Ahora"}
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
                                                        ? "Abriendo tienda automáticamente en los horarios establecidos"
                                                        : "La tienda permanece cerrada"
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
                                </Grid>

                                {
                                    storeDetails.online_reservation && (
                                        <Grid item xs={12} md={6}>
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
                                                                ? "Recibiendo reservaciones automáticamente en los horarios establecidos"
                                                                : "No se reciben reservaciones"
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