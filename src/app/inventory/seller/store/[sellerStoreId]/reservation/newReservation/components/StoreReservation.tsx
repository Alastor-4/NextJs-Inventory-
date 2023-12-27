"use client"
import {
    AppBar,
    Box,
    Card,
    CardContent,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Stack,
    Toolbar,
    Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { reservation } from '../request/reservation'
import { AddTask, ArrowLeft, DeliveryDiningOutlined, VisibilityOutlined } from '@mui/icons-material'
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog'
import StoreModalStatusOptions from './statusOptions/components/StoreModalStatusOptions'
import StatusOptions from './statusOptions/components/StatusOptions'
import dayjs from 'dayjs'
import { TableNoData } from '@/components/TableNoData'
import { useRouter } from 'next/navigation'

export default function StoreReservation({ userId, storeId }: { userId: string, storeId: string }) {

    const router = useRouter()

    const [dataReservation, setDataReservation] = useState<any>([])
    const [selectedReservation, setSelectedReservation] = useState<any>(null)

    const [justCancel, setJustCancel] = useState(false)

    useEffect(() => {
        if (selectedReservation !== null) {
            if (dataReservation[selectedReservation].reservation_status.code === 1) {

                dataReservation[selectedReservation].reservation_products.forEach((element: any) => {
                    if (element.units_quantity > element.store_depots.product_remaining_units) {
                        setJustCancel(true)
                    }
                })
            }
        } else setJustCancel(false)

    }, [selectedReservation, dataReservation])

    useEffect(() => {
        const getDataReservation = async () => {
            let newDataReservation = await reservation.getAllReservations(storeId)

            setDataReservation(
                newDataReservation.sort((a: any, b: any) => -(dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()))
            )
        }
        getDataReservation()
    }, [userId, storeId])

    const handleNavigateBack = () => {
        router.push("/inventory/seller/store/1")
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
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
                        Reservaciones
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const ReservationNotification = () => {

        const [openImageDialog, setOpenImageDialog] = useState(false);
        const [dialogImages, setDialogImages] = useState([])

        const [activeModalStatusOptions, setActiveModalStatusOptions] = useState(false)

        const reservationStatusColors: any = {
            1: "warning",
            2: "error",
            3: "info",
            4: "success",
            5: "secondary",
            6: "success",
        }

        let controlDates = "0"

        const daysOfReservations = (reservationDate: any) => {
            if (!(dayjs(controlDates).isSame(dayjs(reservationDate), "day"))) {
                controlDates = reservationDate
                return (
                    <Chip label={dayjs(controlDates).format("DD/MM/YY")} />
                )
            }
            return false
        }

        const selectReservation = (index: number) => {
            setSelectedReservation(selectedReservation === index ? null : index)
        }

        const offerText = (compareFunction: string, compareUnits: number, newPrice: number, currency: string) => (
            <Box>
                {compareFunction === '='
                    ? `Cuando compren ${compareUnits} unidades de este producto, cada unidad tendrá un precio de ${newPrice} `
                    : `Cuando compren más de ${compareUnits} unidades de este producto, cada unidad tendrá un precio de ${newPrice} `
                }
                <small>{currency}</small>
            </Box>
        )

        function handleOpenImagesDialog(images: any) {
            setDialogImages(images)
            setOpenImageDialog(true)
        }

        return (
            <>
                <ImagesDisplayDialog
                    dialogTitle={"Imágenes del producto"}
                    open={openImageDialog}
                    setOpen={setOpenImageDialog}
                    images={dialogImages}
                />
                <StoreModalStatusOptions
                    dialogTitle={"Nuevo Estado"}
                    open={activeModalStatusOptions}
                    setOpen={setActiveModalStatusOptions}
                    setDataReservation={setDataReservation}
                    storeId={storeId}
                >
                    <StatusOptions
                        storeId={storeId}
                        indUpdate={selectedReservation}
                        dataReservation={dataReservation}
                        delivery={dataReservation[selectedReservation]?.request_delivery}
                        reservationStatusColors={reservationStatusColors}
                        justCancel={justCancel}
                    />
                </StoreModalStatusOptions>

                <Stack spacing={2} >
                    {
                        dataReservation.map((userReservation: any, index: any) => (
                            <React.Fragment key={index}>

                                {daysOfReservations(userReservation.created_at)}

                                <Card
                                    key={index}
                                    sx={{ padding: "10px", paddingTop: "15px" }}

                                >

                                    <Collapse in={true} timeout={"auto"} unmountOnExit >
                                        {
                                            selectedReservation !== index
                                                ? (
                                                    <Box
                                                        component={'div'}
                                                        fontSize={14.5}
                                                        onClick={() => selectReservation(index)}
                                                    >
                                                        <Grid container >
                                                            <Grid item container rowGap={2} xs={12}>

                                                                <Grid item container justifyContent={"space-between"}>

                                                                    <Grid item alignSelf={'center'} >
                                                                        {userReservation.users.username}
                                                                    </Grid>

                                                                    <Grid item container spacing={1} xs={'auto'}>
                                                                        {
                                                                            userReservation.request_delivery === true &&
                                                                            (
                                                                                <Grid item>
                                                                                    <Chip
                                                                                        label={
                                                                                            <DeliveryDiningOutlined />
                                                                                        }
                                                                                        size='small'
                                                                                        color='primary'
                                                                                    />
                                                                                </Grid>
                                                                            )
                                                                        }


                                                                        <Grid item >
                                                                            <Chip
                                                                                label={
                                                                                    userReservation.reservation_status.name
                                                                                }
                                                                                size={"small"}
                                                                                color={reservationStatusColors[userReservation.reservation_status.code]}
                                                                            />
                                                                        </Grid>

                                                                    </Grid>


                                                                </Grid>

                                                                <Grid item container justifyContent={"space-between"}>

                                                                    <Grid item container spacing={1} xs={"auto"} alignItems={'center'}>
                                                                        <Grid item>
                                                                            {userReservation.total_price}
                                                                        </Grid>

                                                                        <Grid item>
                                                                            <small>
                                                                                {userReservation.payment_method}
                                                                            </small>
                                                                        </Grid>
                                                                    </Grid>

                                                                    <Grid item sx={{ marginLeft: "auto", marginRight: "2%" }}>
                                                                        <Typography variant='subtitle2' >{dayjs(userReservation.created_at).format("hh:mm A")}</Typography>
                                                                    </Grid>

                                                                </Grid>


                                                            </Grid>
                                                        </Grid>

                                                    </Box>

                                                )
                                                : (
                                                    <>
                                                        <Box component={"div"} display={"flex"} justifyContent={"flex-end"}>
                                                            <IconButton
                                                                sx={{ position: "fixed", backgroundColor: "primary.main", border: "1px solid black", '&:hover': { backgroundColor: 'primary.main' } }}
                                                                onClick={() => setActiveModalStatusOptions(true)}
                                                            >
                                                                <AddTask sx={{ color: "black" }} />
                                                            </IconButton>
                                                        </Box>

                                                        <Grid container direction={"column"} sx={{ padding: "8px 26px" }} spacing={2} fontSize={14.5}>
                                                            <Grid item container spacing={2} alignItems={'center'} position={'relative'} >
                                                                <Grid item position={"absolute"} >
                                                                    <IconButton
                                                                        onClick={() => selectReservation(index)}
                                                                    >
                                                                        <ArrowLeft color='primary' fontSize='large' />
                                                                    </IconButton>
                                                                </Grid>
                                                                <Grid item marginX={'auto'}>
                                                                    <Chip
                                                                        label={
                                                                            userReservation.reservation_status.name
                                                                        }

                                                                        color={reservationStatusColors[userReservation.reservation_status.code]}
                                                                    />
                                                                </Grid>
                                                            </Grid>

                                                            {/*Detalles de la reservacion*/}
                                                            <Grid item xs={12}>
                                                                <Card variant='outlined' sx={{ padding: "10px 10px" }}>
                                                                    <Grid container direction={"column"} spacing={1}>
                                                                        <Grid item >
                                                                            <Typography variant="subtitle1" component="div" sx={{ textDecoration: "underline" }} >Detalles de la reservación:</Typography>
                                                                        </Grid>

                                                                        <Grid item container direction={"column"} spacing={1.5} xs={"auto"}>
                                                                            <Grid item container spacing={1} xs={true}>
                                                                                <Grid item sx={{ fontWeight: 600 }}>Usuario: </Grid>
                                                                                <Grid item xs={true}>
                                                                                    {userReservation.users.username}
                                                                                </Grid>
                                                                            </Grid>

                                                                            <Grid item container columnGap={1} xs={true}>
                                                                                <Grid item sx={{ fontWeight: 600 }}>Precio a pagar: </Grid>
                                                                                <Grid item container columnGap={1} xs={true}>
                                                                                    <Grid item>
                                                                                        {userReservation.total_price}
                                                                                    </Grid>
                                                                                    <Grid item >
                                                                                        <small>
                                                                                            {userReservation.payment_method}
                                                                                        </small>
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </Grid>

                                                                            <Grid item container xs={true} spacing={1} alignItems={'center'}>
                                                                                <Grid item sx={{ fontWeight: 600 }} >Estado: </Grid>
                                                                                <Grid item xs={true}>
                                                                                    <Chip
                                                                                        label={
                                                                                            userReservation.reservation_status.name
                                                                                        }
                                                                                        size={"small"}
                                                                                        color={reservationStatusColors[userReservation.reservation_status.code]}
                                                                                    />
                                                                                </Grid>
                                                                            </Grid>

                                                                            <Grid item container columnGap={1} xs={true} alignItems={'center'}>
                                                                                <Grid item sx={{ fontWeight: 600 }} >Domicilio: </Grid>
                                                                                <Grid item xs={true}>
                                                                                    <Chip
                                                                                        label={
                                                                                            userReservation.request_delivery === true ? "Solicitado" : "No solicitado"
                                                                                        }
                                                                                        size={"small"}
                                                                                        color={
                                                                                            userReservation.request_delivery === true ? "success" : "error"
                                                                                        }
                                                                                    />
                                                                                </Grid>
                                                                            </Grid>

                                                                            <Grid item container xs={12} columnGap={1} alignItems={'center'}>
                                                                                <Grid item sx={{ fontWeight: 600 }}>Mensaje: </Grid>

                                                                                {
                                                                                    userReservation.delivery_notes
                                                                                        ? (
                                                                                            <Grid
                                                                                                container
                                                                                                item
                                                                                                sx={{
                                                                                                    width: 'fit-content',
                                                                                                    backgroundColor: "lightgray",
                                                                                                    padding: "2px 4px",
                                                                                                    borderRadius: "5px 2px 2px 2px",
                                                                                                    border: "1px solid",
                                                                                                    borderColor: "seagreen",
                                                                                                    fontSize: 14,
                                                                                                    cursor: "default",
                                                                                                    textDecorationLine: "none",
                                                                                                }}
                                                                                            >
                                                                                                <Grid container item xs={true} alignItems={"center"}
                                                                                                    sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                                                                    {
                                                                                                        userReservation.delivery_notes
                                                                                                    }
                                                                                                </Grid>
                                                                                            </Grid>
                                                                                        )
                                                                                        : '-'
                                                                                }

                                                                            </Grid>

                                                                        </Grid>
                                                                    </Grid>
                                                                </Card>
                                                            </Grid>

                                                            {/*Datos del cliente*/}
                                                            <Grid item xs={12}>
                                                                <Card variant='outlined' sx={{ padding: "10px 10px" }}>
                                                                    <Grid container direction={"column"} spacing={1}>
                                                                        <Grid item>
                                                                            <Typography variant="subtitle1" component="div" sx={{ textDecoration: "underline" }}>Datos del cliente:</Typography>
                                                                        </Grid>

                                                                        <Grid item container direction={"column"} spacing={1.5} xs={'auto'} >
                                                                            <Grid item container spacing={1} xs={true} >
                                                                                <Grid item sx={{ fontWeight: 600 }} >Nombre: </Grid>
                                                                                <Grid item>
                                                                                    {`${userReservation.users.name} (${userReservation.users.username})`}
                                                                                </Grid>
                                                                            </Grid>

                                                                            <Grid item container spacing={1} xs={true}>
                                                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Correo: </Grid>
                                                                                <Grid item xs={"auto"}>
                                                                                    {
                                                                                        userReservation.users.mail
                                                                                            ? userReservation.users.mail
                                                                                            : "-"
                                                                                    }
                                                                                </Grid>
                                                                            </Grid>

                                                                            <Grid item container spacing={1} xs={true}>
                                                                                <Grid item sx={{ fontWeight: 600 }}>Teléfono: </Grid>
                                                                                <Grid item>
                                                                                    {userReservation.users.phone}
                                                                                </Grid>
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Card>
                                                            </Grid>

                                                            {/*Productos Solicitados*/}
                                                            <Grid item xs={12}>
                                                                <Card variant='outlined' sx={{ padding: "10px 10px" }}>
                                                                    <Grid container direction={"column"} spacing={1}>
                                                                        <Grid item>
                                                                            <Typography variant="subtitle1" component="div" sx={{ textDecoration: "underline" }}>Productos Solicitados:</Typography>
                                                                        </Grid>
                                                                        {
                                                                            userReservation.reservation_products.map((reservationProduct: any, productIndex: any) => (
                                                                                <Grid item key={productIndex}>
                                                                                    <Card variant='outlined' sx={{ padding: "10px 10px" }}>
                                                                                        <Grid container spacing={1.5}>
                                                                                            <Grid item>{`Producto #${productIndex + 1}`}</Grid>

                                                                                            <Grid item container xs={12} columnGap={1}>
                                                                                                <Grid item sx={{ fontWeight: 600 }}>Producto: </Grid>
                                                                                                <Grid item>
                                                                                                    {reservationProduct.store_depots.depots.products.name}
                                                                                                    {
                                                                                                        reservationProduct.store_depots.depots.products.description && (
                                                                                                            <small>
                                                                                                                {` ${reservationProduct.store_depots.depots.products.description}`}
                                                                                                            </small>

                                                                                                        )
                                                                                                    }
                                                                                                </Grid>
                                                                                            </Grid>


                                                                                            <Grid item container xs={12} columnGap={1}>
                                                                                                <Grid item sx={{ fontWeight: 600 }}>Departamento: </Grid>
                                                                                                <Grid item>
                                                                                                    {reservationProduct.store_depots.depots.products.departments.name}
                                                                                                </Grid>
                                                                                            </Grid>

                                                                                            <Grid container item spacing={1} xs={12}>
                                                                                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                                                                <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                                                                                                    {reservationProduct.store_depots.depots.products.characteristics.length > 0
                                                                                                        ? reservationProduct.store_depots.depots.products.characteristics.map((item: any) => (
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
                                                                                                        )
                                                                                                        ) : "-"
                                                                                                    }
                                                                                                </Grid>
                                                                                            </Grid>

                                                                                            <Grid container item spacing={1} xs={12}>
                                                                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Imágenes:</Grid>
                                                                                                <Grid item xs={true}>
                                                                                                    {
                                                                                                        reservationProduct.store_depots.depots.products.images.length > 0
                                                                                                            ? (
                                                                                                                <Box
                                                                                                                    sx={{ cursor: "pointer", display: "inline-flex", alignItems: "center", color: "blue" }}
                                                                                                                    onClick={() => handleOpenImagesDialog(reservationProduct.store_depots.depots.products.images)}
                                                                                                                >
                                                                                                                    {reservationProduct.store_depots.depots.products.images.length}

                                                                                                                    <VisibilityOutlined fontSize={"small"}
                                                                                                                        sx={{ ml: "5px" }} />
                                                                                                                </Box>
                                                                                                            ) : "no"
                                                                                                    }
                                                                                                </Grid>
                                                                                            </Grid>

                                                                                            <Grid item container xs={12} spacing={1} alignItems={"center"}>
                                                                                                <Grid item sx={{ fontWeight: 600 }}>Unidades solicitadas: </Grid>

                                                                                                <Grid item container spacing={1} alignItems={'center'} xs={true}>
                                                                                                    <Grid item>
                                                                                                        {reservationProduct.units_quantity}
                                                                                                    </Grid>
                                                                                                    <Grid item>
                                                                                                        {
                                                                                                            dataReservation[selectedReservation].reservation_status.code === 1
                                                                                                                ? (
                                                                                                                    reservationProduct.units_quantity && (
                                                                                                                        <Chip
                                                                                                                            label={
                                                                                                                                `Disponible ${reservationProduct.store_depots.product_remaining_units}`
                                                                                                                            }
                                                                                                                            size='small'
                                                                                                                            color={
                                                                                                                                reservationProduct.store_depots.product_remaining_units < reservationProduct.units_quantity
                                                                                                                                    ? "error"
                                                                                                                                    : "success"
                                                                                                                            }
                                                                                                                        />

                                                                                                                    )
                                                                                                                )
                                                                                                                : ""
                                                                                                        }
                                                                                                    </Grid>
                                                                                                </Grid>
                                                                                            </Grid>

                                                                                            <Grid item container xs={12} columnGap={1}>
                                                                                                <Grid item sx={{ fontWeight: 600 }}>Precio Total: </Grid>
                                                                                                <Grid item>
                                                                                                    {`${reservationProduct.price} `}
                                                                                                    {
                                                                                                        <small>
                                                                                                            {reservationProduct.store_depots.sell_price_unit}
                                                                                                        </small>
                                                                                                    }

                                                                                                </Grid>
                                                                                            </Grid>

                                                                                            <Grid item container xs={12} columnGap={1}>
                                                                                                <Grid item sx={{ fontWeight: 600 }}>Descuento: </Grid>
                                                                                                <Grid item>
                                                                                                    {
                                                                                                        reservationProduct.applied_discount
                                                                                                            ? reservationProduct.applied_discount.price_discount_percentage
                                                                                                                ? `${reservationProduct.applied_discount.price_discount_percentage}%`
                                                                                                                : (
                                                                                                                    <>
                                                                                                                        {`${reservationProduct.applied_discount.price_discount_quantity} `}
                                                                                                                        <small>{`${reservationProduct.store_depots.sell_price_unit}`}</small>
                                                                                                                    </>
                                                                                                                )
                                                                                                            : "-"

                                                                                                    }

                                                                                                </Grid>
                                                                                            </Grid>

                                                                                            <Grid item container xs={12} columnGap={1} alignItems={'center'}>
                                                                                                <Grid item sx={{ fontWeight: 600 }}>Oferta: </Grid>

                                                                                                {
                                                                                                    reservationProduct.applied_offer
                                                                                                        ? (
                                                                                                            <Grid
                                                                                                                container
                                                                                                                item
                                                                                                                sx={{
                                                                                                                    width: 'fit-content',
                                                                                                                    backgroundColor: "lightgray",
                                                                                                                    padding: "2px 4px",
                                                                                                                    borderRadius: "5px 2px 2px 2px",
                                                                                                                    border: "1px solid",
                                                                                                                    borderColor: "seagreen",
                                                                                                                    fontSize: 14,
                                                                                                                    cursor: "default",
                                                                                                                    textDecorationLine: "none",
                                                                                                                }}
                                                                                                            >
                                                                                                                <Grid container item xs={true} alignItems={"center"}
                                                                                                                    sx={{ color: "rgba(16,27,44,0.8)" }}>
                                                                                                                    {
                                                                                                                        offerText(
                                                                                                                            reservationProduct.applied_offer.compare_function,
                                                                                                                            reservationProduct.applied_offer.compare_units_quantity,
                                                                                                                            reservationProduct.applied_offer.price_per_unit,
                                                                                                                            reservationProduct.store_depots.sell_price_unit

                                                                                                                        )
                                                                                                                    }
                                                                                                                </Grid>
                                                                                                            </Grid>
                                                                                                        )
                                                                                                        : "-"
                                                                                                }


                                                                                            </Grid>
                                                                                        </Grid>
                                                                                    </Card>
                                                                                </Grid>
                                                                            )

                                                                            )
                                                                        }
                                                                    </Grid>
                                                                </Card>
                                                            </Grid>

                                                        </Grid>
                                                    </>
                                                )
                                        }
                                    </Collapse>
                                </Card>
                            </React.Fragment>
                        ))
                    }
                </Stack>
            </>

        )
    }

    return (
        <>
            <Card variant='outlined'>
                <CustomToolbar />

                <CardContent>
                    {
                        dataReservation.length !== 0
                            ? <ReservationNotification />
                            : <TableNoData />
                    }

                </CardContent>
            </Card>
        </>
    )
}
