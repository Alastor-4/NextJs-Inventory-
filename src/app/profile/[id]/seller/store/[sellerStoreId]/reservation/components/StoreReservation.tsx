"use client"

import React from "react";
import {
    AppBar,
    Box, Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from "@mui/material";
import {TableNoData} from "@/components/TableNoData";
import {
    ArrowLeft,
    CancelOutlined,
    DeliveryDiningOutlined, DeliveryDiningTwoTone,
    DescriptionOutlined,
    Done,
    SellOutlined,
    VisibilityOutlined
} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import {InfoTag, MoneyInfoTag} from "@/components/InfoTags";
import {dateFormat, numberFormat} from "@/utils/generalFunctions";
import sellerStoreReservations
    from "@/app/profile/[id]/seller/store/[sellerStoreId]/reservation/requests/sellerStoreReservations";

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function StoreReservation({userId, storeId}: { userId: string, storeId: string }) {
    const router = useRouter()

    const [data, setData] = React.useState<null | any[]>(null)

    //ToDo: use global isLoading
    const isLoading = false

    //get initial data
    React.useEffect(() => {
        fetcher(`/profile/${userId}/seller/store/${storeId}/reservation/api`).then((data) => setData(data))
    }, [userId, storeId])

    function handleNavigateBack() {
        router.back()
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", color: "white"}}>
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <IconButton color={"inherit"} sx={{mr: "10px"}} onClick={handleNavigateBack}>
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
                        Reservaciones
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        const headCells = [
            {
                id: "name",
                label: "Nombre",
                align: "left"
            },
            {
                id: "department",
                label: "Departamento",
                align: "left"
            },
            {
                id: "price",
                label: "Precio",
                align: "left"
            },
            {
                id: "status",
                label: "Disponibles",
                align: "left"
            },
            {
                id: "reservation",
                label: "Reservación",
                align: "center"
            },
        ]

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            //@ts-ignore
                            align={headCell.align ?? "left"}
                            padding={'normal'}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    //expand description
    const [expandIndex, setExpandIndex] = React.useState<null | number>(null)

    function handleExpandRow(index: number) {
        if (expandIndex === index) {
            setExpandIndex(null)
        } else {
            setExpandIndex(index)
        }
    }

    const [openImageDialog, setOpenImagesDialog] = React.useState(false)
    const [dialogImages, setDialogImages] = React.useState<any[]>([])

    function handleOpenImagesDialog(images: any[]) {
        setDialogImages(images)
        setOpenImagesDialog(true)
    }

    async function setReservedStatus(e: any, storeDepotId: number, productReservationId: number) {
        e.stopPropagation()

        const response = await sellerStoreReservations.setReservedStatus(userId, storeId, storeDepotId, productReservationId)

        if (response) {
            if (data?.length) {
                const newData = [...data]

                const reservationIndex = data.findIndex((item: any) => item.id === productReservationId)
                if (reservationIndex > -1) {
                    newData[reservationIndex] = response
                }

                setData(newData)
            }
        }
    }

    async function setCanceledStatus(e: any, productReservationId: number) {
        e.stopPropagation()

        const response = await sellerStoreReservations.setCanceledStatus(userId, storeId, productReservationId)

        if (response) {
            if (data?.length) {
                const newData = [...data]

                const reservationIndex = data.findIndex((item: any) => item.id === productReservationId)
                if (reservationIndex > -1) {
                    newData[reservationIndex] = response
                }

                setData(newData)
            }
        }
    }

    const reservationStatusColors = {
        1: "warning",
        2: "error",
        3: "info",
        4: "success",
        5: "secondary",
        6: "success",
    }

    const TableContent = () => {
        return (
            <TableBody>
                {data?.map(
                        (row) => {
                            const baseProductPrice = row.store_depots.sell_price === "0"
                                ? null
                                : numberFormat(row.store_depots.sell_price)

                            const priceDiscountQuantity = baseProductPrice
                                ? row.store_depots.price_discount_percentage
                                    ? row.store_depots.price_discount_percentage * parseFloat(String(baseProductPrice)) / 100
                                    : row.store_depots.price_discount_quantity
                                : null

                            const finalProductPrice = baseProductPrice && priceDiscountQuantity
                                ? (parseFloat(String(baseProductPrice)) - priceDiscountQuantity)
                                : baseProductPrice

                            const sellerProfitQuantity = finalProductPrice
                                ? row.store_depots.seller_profit_percentage
                                    ? row.store_depots.seller_profit_percentage * finalProductPrice / 100
                                    : row.store_depots.seller_profit_quantity
                                : null

                            const displayProductPrice = finalProductPrice
                                ? `${numberFormat(String(finalProductPrice)) + " " + row.store_depots.sell_price_unit}`
                                : "sin precio"

                            const displayPriceDiscount = baseProductPrice
                                ? row.store_depots.price_discount_percentage
                                    ? numberFormat(row.store_depots.price_discount_percentage) + " %"
                                    : row.store_depots.price_discount_quantity
                                        ? numberFormat(row.store_depots.price_discount_quantity) + " " + row.store_depots.sell_price_unit
                                        : null
                                : null

                            return (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                        selected={row.id === expandIndex}
                                        onClick={() => handleExpandRow(row.id)}
                                    >
                                        <TableCell>
                                            {row.store_depots.depots.products.name} <br/>
                                            {
                                                row.store_depots.depots.products?.description && (
                                                    <small>
                                                        {` ${row.store_depots.depots.products.description.slice(0, 20)}`}
                                                    </small>
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {row.store_depots.depots.products.departments.name}
                                        </TableCell>
                                        <TableCell>
                                            <MoneyInfoTag value={displayProductPrice} errorColor={!baseProductPrice}/>
                                            {row.store_depots.offer_notes && (
                                                <DescriptionOutlined fontSize={"small"}/>
                                            )}
                                            <br/>
                                            {
                                                displayPriceDiscount && <InfoTag value={`- ${displayPriceDiscount}`}/>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Grid container columnSpacing={1}>
                                                <Grid container item xs={4} alignItems={"center"}>
                                                    <Box
                                                        sx={
                                                            {
                                                                display: "inline-flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                padding: "2px 4px",
                                                                color: "darkblue",
                                                                backgroundColor: "lightgrey",
                                                                borderRadius: "6px",
                                                                border: "1px solid black",
                                                                fontSize: "18px"
                                                            }
                                                        }>
                                                        {row.store_depots.product_remaining_units}
                                                    </Box>
                                                </Grid>
                                                <Grid
                                                    container
                                                    item
                                                    xs={8}
                                                    alignItems={"center"}
                                                >
                                                    <Chip
                                                        variant={"outlined"}
                                                        label={
                                                        row.store_depots.is_active
                                                            ? "EN VENTA"
                                                            : "INACTIVO"
                                                        }
                                                        size={"small"}
                                                        color={row.store_depots.is_active ? "success" : "default"}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>

                                        <TableCell>
                                            <Grid container rowSpacing={1}>
                                                <Grid container item xs={8}>
                                                    <Grid container item xs={12} justifyContent={"center"} alignItems={"center"}>
                                                        <Chip
                                                            label={
                                                                row.reservation_status.code === 1
                                                                    ? row.reservation_status.name + " (" + row.units_quantity + ")"
                                                                    : row.units_quantity + " | " + row.reservation_status.name
                                                            }
                                                            size={"small"}
                                                            //@ts-ignore
                                                            color={reservationStatusColors[row.reservation_status.code]}
                                                        />

                                                        {
                                                            row.request_delivery
                                                            && <IconButton
                                                                size={"small"}
                                                                disableRipple
                                                                disableFocusRipple
                                                                disableTouchRipple
                                                                sx={
                                                                    {
                                                                        ml: "5px",
                                                                        backgroundColor: "lightslategray",
                                                                        color: "white",
                                                                        cursor: "default"
                                                                    }
                                                                }>
                                                                <DeliveryDiningOutlined fontSize={"small"}/>
                                                            </IconButton>
                                                        }
                                                    </Grid>
                                                    <Grid container item xs={12} justifyContent={"center"}>
                                                        {dateFormat(row.created_at, true)}
                                                    </Grid>
                                                </Grid>

                                                <Grid item container xs={4} justifyContent={"center"}>
                                                    {
                                                        row.reservation_status.code === 1 && (
                                                            <>
                                                                <IconButton color={"info"} onClick={(e) => setReservedStatus(e, row.store_depots.id, row.id)}>
                                                                    <Done/>
                                                                </IconButton>
                                                            </>
                                                        )
                                                    }

                                                    {
                                                        row.reservation_status.code === 3 && (
                                                            <>
                                                                {
                                                                    row.request_delivery && (
                                                                        <IconButton color={"warning"}>
                                                                            <DeliveryDiningOutlined/>
                                                                        </IconButton>
                                                                    )
                                                                }

                                                                <IconButton color={"success"}>
                                                                    <SellOutlined/>
                                                                </IconButton>
                                                            </>
                                                        )
                                                    }

                                                    {
                                                        row.reservation_status.code === 5 && (
                                                            <>
                                                                <IconButton color={"success"} onClick={(e) => setReservedStatus(e, row.store_depots.id, row.id)}>
                                                                    <DeliveryDiningTwoTone/>
                                                                </IconButton>
                                                            </>
                                                        )
                                                    }
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell style={{padding: 0}} colSpan={6}>
                                            <Collapse in={expandIndex === row.id} timeout="auto" unmountOnExit>
                                                <Grid container spacing={1} sx={{padding: "8px 26px"}}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" gutterBottom component="div" sx={{textDecoration: "underline"}}>
                                                            Acciones:
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={true}>
                                                        {
                                                            row.reservation_status.code === 1 && (
                                                                <Button
                                                                    size={"small"}
                                                                    color={"info"}
                                                                    variant={"outlined"}
                                                                    startIcon={<Done fontSize={"small"}/>}
                                                                    onClick={(e) => setReservedStatus(e, row.store_depots.id, row.id)}
                                                                    sx={{mx: "10px"}}
                                                                >
                                                                    Reservar
                                                                </Button>
                                                            )
                                                        }

                                                        {
                                                            row.reservation_status.code === 3 && (
                                                                <>
                                                                    {
                                                                        row.request_delivery && (
                                                                            <Button
                                                                                size={"small"}
                                                                                color={"warning"}
                                                                                variant={"outlined"}
                                                                                startIcon={<DeliveryDiningOutlined fontSize={"small"}/>}
                                                                                //onClick={(e) => setReservedStatus(e, row.store_depots.id, row.id)}
                                                                                sx={{mx: "10px"}}
                                                                            >
                                                                                Comenzar entrega
                                                                            </Button>
                                                                        )
                                                                    }

                                                                    <Button
                                                                        size={"small"}
                                                                        color={"success"}
                                                                        variant={"outlined"}
                                                                        startIcon={<SellOutlined fontSize={"small"}/>}
                                                                        //onClick={(e) => setReservedStatus(e, row.store_depots.id, row.id)}
                                                                        sx={{mx: "10px"}}
                                                                    >
                                                                        Vender
                                                                    </Button>
                                                                </>
                                                            )
                                                        }

                                                        {
                                                            row.reservation_status.code === 5 && (
                                                                <Button
                                                                    size={"small"}
                                                                    color={"success"}
                                                                    variant={"outlined"}
                                                                    startIcon={<DeliveryDiningTwoTone fontSize={"small"}/>}
                                                                    //onClick={(e) => setReservedStatus(e, row.store_depots.id, row.id)}
                                                                    sx={{mx: "10px"}}
                                                                >
                                                                    Entregar
                                                                </Button>
                                                            )
                                                        }

                                                        {
                                                            (row.reservation_status.code === 1 ||
                                                            row.reservation_status.code === 3 ||
                                                            row.reservation_status.code === 5) && (
                                                                <Button
                                                                    size={"small"}
                                                                    color={"error"}
                                                                    variant={"outlined"}
                                                                    startIcon={<CancelOutlined fontSize={"small"}/>}
                                                                    onClick={(e) => setCanceledStatus(e, row.id)}
                                                                    sx={{mx: "10px"}}
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                            )
                                                        }
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" gutterBottom component="div" sx={{textDecoration: "underline"}}>
                                                            Reservación:
                                                        </Typography>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Estado:</Grid>
                                                        <Grid item xs={true}>
                                                            <Chip
                                                                label={`${row.reservation_status.name} | ${row.units_quantity} Productos`}
                                                                size={"small"}
                                                                //@ts-ignore
                                                                color={reservationStatusColors[row.reservation_status.code]}
                                                                sx={{mr: "5px"}}
                                                            />
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                              sx={{fontWeight: 600}}>Usuario solicitante:</Grid>
                                                        <Grid item xs={true}>
                                                            {`${row.users.name} (${row.users.username})`}
                                                        </Grid>
                                                    </Grid>

                                                    {
                                                        row.request_delivery && (
                                                            <Grid container item spacing={1} xs={12} alignItems={"center"}>
                                                                <Grid item xs={12} sx={{fontWeight: 600}}>
                                                                    Domicilio requerido
                                                                    <IconButton
                                                                        size={"small"}
                                                                        disableRipple
                                                                        disableFocusRipple
                                                                        disableTouchRipple
                                                                        sx={
                                                                            {
                                                                                mx: "5px",
                                                                                backgroundColor: "lightslategray",
                                                                                color: "white",
                                                                                cursor: "default",
                                                                            }
                                                                        }>
                                                                        <DeliveryDiningOutlined fontSize={"small"}/>
                                                                    </IconButton>
                                                                </Grid>
                                                                {
                                                                    row.delivery_notes && (
                                                                        <Grid container item xs={12} alignItems={"center"}>
                                                                            {row.delivery_notes}
                                                                        </Grid>
                                                                    )
                                                                }
                                                            </Grid>
                                                        )
                                                    }

                                                    <Grid item xs={12}>
                                                        <Typography variant="subtitle1" gutterBottom component="div" sx={{textDecoration: "underline"}}>
                                                            Producto:
                                                        </Typography>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Producto:</Grid>
                                                        <Grid item xs={true}>
                                                            {row.store_depots.depots.products.name}
                                                            {
                                                                row.store_depots.depots.products.description && (
                                                                    <small>
                                                                        {` ${row.store_depots.depots.products.description}`}
                                                                    </small>
                                                                )
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                              sx={{fontWeight: 600}}>Departamento:</Grid>
                                                        <Grid item xs={true}>{row.store_depots.depots.products.departments?.name ?? "-"}</Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                              sx={{fontWeight: 600}}>Disponibles:</Grid>
                                                        <Grid item xs={true}>
                                                            {row.store_depots.product_remaining_units}
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                              sx={{
                                                                  fontWeight: 600,
                                                                  display: "flex",
                                                                  alignItems: "center"
                                                              }}>Características:</Grid>
                                                        <Grid item xs={true}
                                                              sx={{display: "flex", alignItems: "center"}}>
                                                            {row.store_depots.depots.products.characteristics.length > 0
                                                                ? row.store_depots.depots.products.characteristics.map((item: any) => (
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
                                                                            <Grid container item alignItems={"center"}
                                                                                  sx={{marginRight: "3px"}}>
                                                                                <Typography variant={"caption"}
                                                                                            sx={{
                                                                                                color: "white",
                                                                                                fontWeight: "600"
                                                                                            }}>
                                                                                    {item.name.toUpperCase()}
                                                                                </Typography>
                                                                            </Grid>
                                                                            <Grid container item alignItems={"center"}
                                                                                  sx={{color: "rgba(16,27,44,0.8)"}}>
                                                                                {item.value}
                                                                            </Grid>
                                                                        </Grid>
                                                                    )
                                                                ) : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Imágenes:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                row.store_depots.depots.products.images.length > 0
                                                                    ? (
                                                                        <Box
                                                                            sx={{
                                                                                cursor: "pointer",
                                                                                display: "inline-flex",
                                                                                alignItems: "center",
                                                                                color: "blue"
                                                                            }}
                                                                            onClick={() => handleOpenImagesDialog(row.store_depots.depots.products.images)}
                                                                        >
                                                                            {row.store_depots.depots.products.images.length}

                                                                            <VisibilityOutlined fontSize={"small"}
                                                                                                sx={{ml: "5px"}}/>
                                                                        </Box>
                                                                    ) : "no"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Precio
                                                            base:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                baseProductPrice
                                                                    ? baseProductPrice + " " + row.store_depots.sell_price_unit
                                                                    : "sin precio"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Precio:</Grid>
                                                        <Grid item xs={true}>
                                                            <MoneyInfoTag
                                                                value={displayProductPrice}
                                                                errorColor={!baseProductPrice}
                                                            />
                                                            {
                                                                priceDiscountQuantity && (
                                                                    <InfoTag value={`- ${displayPriceDiscount} descuento`}/>
                                                                )
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"}
                                                              sx={{fontWeight: 600}}>Distribución:</Grid>
                                                        <Grid item xs={true}>
                                                            {
                                                                (baseProductPrice && sellerProfitQuantity && finalProductPrice)
                                                                    ? `Dueño: ${numberFormat(String(finalProductPrice - sellerProfitQuantity))} | Vendedor: ${numberFormat(sellerProfitQuantity)}`
                                                                    : "-"
                                                            }
                                                        </Grid>
                                                    </Grid>

                                                    <Grid container item spacing={1} xs={12}>
                                                        <Grid item xs={"auto"} sx={{fontWeight: 600}}>Ofertas:</Grid>
                                                        <Grid item xs={true}>
                                                            {row.store_depots.offer_notes ?? "-"}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            )
                        })}
            </TableBody>
        )
    }

    return (
        <Card variant={"outlined"}>
            <ImagesDisplayDialog
                dialogTitle={"Imágenes del producto"}
                open={openImageDialog}
                setOpen={setOpenImagesDialog}
                images={dialogImages}
            />

            <CustomToolbar/>

            <CardContent>
                {
                    data && data.length > 0
                        ? (
                            <Table sx={{width: "100%", mt: "20px"}} size={"small"}>
                                <TableHeader/>

                                <TableContent/>
                            </Table>
                        ) : (
                            <TableNoData/>
                        )
                }
            </CardContent>
        </Card>
    )
}