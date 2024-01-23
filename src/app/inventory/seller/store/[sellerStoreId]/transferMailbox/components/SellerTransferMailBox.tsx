"use client"
import {ArrowLeft, ArrowLeftOutlined, Cancel, Done, Money, VisibilityOutlined} from '@mui/icons-material'
import {AppBar, Box, Button, Card, CardContent, Chip, Grid, IconButton, Toolbar, Typography} from '@mui/material'
import {useRouter} from 'next/navigation'
import React, {useEffect, useState} from 'react'
import transfer from '../request/transfer'
import dayjs from 'dayjs'
import {images} from '@prisma/client'
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog'
import {DataTransferReceived, TransferStoreDepots} from './TypeTransfers'
import ModalSellProducts from './ModalSellProducts'

interface SellerTransferMailboxProps {
    userId?: number
    storeId?: number
    sent: boolean
}

interface DataStatus {
    1: { name: string, color: 'warning' | "success" | "error" }
    2: { name: string, color: 'warning' | "success" | "error" }
    3: { name: string, color: 'warning' | "success" | "error" }
}


function SellerTransferMailBox({ userId, storeId, sent }: SellerTransferMailboxProps) {

    const router = useRouter()

    const [dataTransfer, setDataTransfer] = useState<DataTransferReceived[]>([])
    const [data, setData] = useState<DataTransferReceived[][]>([])

    const [forceRender, setForceRender] = useState(true)
    //get initial data
    useEffect(() => {
        const checkStatus = (item: DataTransferReceived) => {
            if (item.from_store_accepted) return 1
            if (item.to_store_accepted) return 2
            else return 3
        }

        const getAllTransfersReceived = async () => {
            const newDataTransfer = await transfer.getAllTransfersReceived(storeId!)
            if (newDataTransfer) {
                setDataTransfer(
                    newDataTransfer
                        .sort((dateA: DataTransferReceived, dateB: DataTransferReceived) =>
                            -(dayjs(dateA.created_at).diff(dayjs(dateB.created_at))
                            ))
                        .map((item: DataTransferReceived) => (
                            { ...item, transferStatus: checkStatus(item) }
                        ))
                )
            }
        }

        const getAllTransferSent = async () => {
            let newDataTransfer = await transfer.getAllTransfersSent(storeId!)
            for (let item of newDataTransfer) {
                item.store_depots.stores = item.stores
            }

            setDataTransfer(
                newDataTransfer
                    .sort((dateA: DataTransferReceived, dateB: DataTransferReceived) =>
                        -(dayjs(dateA.created_at).diff(dayjs(dateB.created_at))
                        ))
                    .map((item: DataTransferReceived) => (
                        { ...item, transferStatus: checkStatus(item) }
                    ))
            )
        }

        if ((storeId && userId) || forceRender) {
            sent
                ? getAllTransferSent()
                : getAllTransfersReceived()

            setForceRender(false)
        }
    }, [storeId, userId, sent, forceRender])

    useEffect(() => {
        if (dataTransfer.length) {

            let newData: DataTransferReceived[][] = [];

            let auxDate = dayjs("0")
            let actualIndex = -1

            dataTransfer.forEach((element: DataTransferReceived) => {

                if (!(dayjs(auxDate).isSame(dayjs(element.created_at), 'day'))) {
                    auxDate = dayjs(element.created_at)
                    actualIndex++
                    newData.push([])
                }

                newData[actualIndex].push(element)
            })

            setData(newData)
        }

    }, [dataTransfer])


    const handleNavigateBack = () => {
        router.push(`/inventory/seller/store/${storeId}`)
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
                        Transferencias
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const dataTransferStatus: DataStatus = {
        1: { name: "Pendiente", color: "warning" },
        2: { name: "Aceptada", color: "success" },
        3: { name: "Cancelada", color: "error" }
    }

    const [selected, setSelected] = useState<DataTransferReceived | null>(null)

    const handleClickSelected = (item: DataTransferReceived | null) => {
        setSelected(item)
    }

    function ShowTransfer({ transfers }: { transfers: DataTransferReceived[] }) {
        const ShowTransferDetails = ({ dataItem }: { dataItem: DataTransferReceived }) => {
            const TransferOptions = () => {
                const [activeModalSell, setActiveModalSell] = useState(false)
                const [storeDepotDetails, setStoreDepotDetails] = useState<null | TransferStoreDepots>(null)

                const changeStatus = async (dataChangeStatus: { id: number, from_store_accepted: boolean, to_store_accepted: boolean, transfer_cancelled: boolean }) => {
                    const result = await transfer.changeTransferStatus(storeId!, dataChangeStatus)

                    setForceRender(true)

                    return result
                }

                const updateProductUnits = async (data: { id: number, product_remaining_units: number, product_units: number }) => {
                    return await transfer.addNewUnits(storeId!, data)
                }

                const handleAccept = async (remainingUnits: number) => {
                    let ok: number | boolean = false
                    let product = await transfer.getStoreDepot(storeId!, dataItem.store_depots.depots.product_id)

                    if (product) {
                        const data = {
                            id: product.id,
                            product_remaining_units: product.product_remaining_units + dataItem.units_transferred_quantity,
                            product_units: product.product_units + dataItem.units_transferred_quantity
                        }

                        ok = await transfer.addNewUnits(storeId!, data)
                    } else {
                        const data = {
                            store_id: storeId!,
                            depot_id: dataItem.store_depots.depot_id,
                            product_remaining_units: remainingUnits,
                            product_units: dataItem.units_transferred_quantity,
                            seller_profit_percentage: dataItem.store_depots.seller_profit_percentage,
                            is_active: dataItem.store_depots.is_active,
                            sell_price: dataItem.store_depots.sell_price,
                            sell_price_unit: dataItem.store_depots.sell_price_unit,
                            seller_profit_quantity: dataItem.store_depots.seller_profit_quantity,
                            price_discount_percentage: dataItem.store_depots.price_discount_percentage,
                            price_discount_quantity: dataItem.store_depots.price_discount_quantity,
                            seller_profit_unit: dataItem.store_depots.seller_profit_unit,
                        }
                        ok = await transfer.createInstanceInStore(storeId!, data)
                        product = await transfer.getStoreDepot(storeId!, dataItem.store_depots.depots.product_id)

                        if (ok && dataItem.store_depots.product_offers.length) {
                            const dataOffers = {
                                product_offers: dataItem.store_depots.product_offers.map((offers) => (
                                    {
                                        compare_units_quantity: offers.compare_units_quantity,
                                        compare_function: offers.compare_function,
                                        price_per_unit: offers.price_per_unit,
                                        store_depot_id: product.id,
                                        is_active: offers.is_active
                                    }
                                ))
                            }
                            ok = await transfer.addNewOffers(storeId!, dataOffers)
                        }
                    }

                    if (ok) {
                        changeStatus({
                            id: dataItem.id,
                            from_store_accepted: false,
                            to_store_accepted: true,
                            transfer_cancelled: false
                        })
                    }

                }

                const handleSell = async () => {
                    const product = await transfer.getStoreDepot(storeId!, dataItem.store_depots.depots.product_id)
                    setStoreDepotDetails(
                        product ?? dataItem.store_depots
                    )

                    setActiveModalSell(true)
                }

                const handleCancel = async () => {
                    const dataUpdate = {
                        id: dataItem.store_depot_id,
                        product_remaining_units: dataItem.store_depots.product_remaining_units + dataItem.units_transferred_quantity,
                        product_units: dataItem.store_depots.product_units
                    }

                    const ok = await updateProductUnits(dataUpdate)
                    if (ok) {
                        const dataCancel = {
                            id: dataItem.id,
                            from_store_accepted: false,
                            to_store_accepted: dataItem.to_store_accepted,
                            transfer_cancelled: true
                        }

                        await changeStatus(dataCancel)
                    }

                }


                return (
                    <>
                        <ModalSellProducts
                            open={activeModalSell}
                            setOpen={setActiveModalSell}
                            dialogTitle='Vender'
                            //Datos del producto de la tienda
                            storeId={storeId!}
                            storeDepot={storeDepotDetails!}
                            dataItem={dataItem}
                            handleAccept={handleAccept}

                        />
                        <Card variant='outlined' sx={{ padding: '10px' }}>
                            <Grid item container gap={1} justifyContent={'space-evenly'}>
                                <Grid item>
                                    <Button
                                        variant='outlined'
                                        color='success'
                                        size='small'
                                        startIcon={<Done fontSize='small' />}
                                        onClick={() => handleAccept(dataItem.units_transferred_quantity)}
                                    >
                                        Aceptar
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant='outlined'
                                        color='primary'
                                        size='small'
                                        startIcon={<Money fontSize='small' />}
                                        onClick={handleSell}
                                    >
                                        Vender
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant='outlined'
                                        color='error'
                                        size='small'
                                        startIcon={<Cancel fontSize='small' />}
                                        onClick={handleCancel}
                                    >
                                        Cancelar
                                    </Button>
                                </Grid>
                            </Grid>
                        </Card>
                    </>
                )
            }

            const ProductDetails = () => {
                const [openImageDialog, setOpenImagesDialog] = React.useState(false)
                const [dialogImages, setDialogImages] = React.useState<images[]>([])

                function handleOpenImagesDialog(images: images[]) {
                    setDialogImages(images)
                    setOpenImagesDialog(true)
                }

                return (
                    <Card variant='outlined' sx={{ padding: '10px' }}>
                        <ImagesDisplayDialog
                            open={openImageDialog}
                            setOpen={setOpenImagesDialog}
                            images={dialogImages}
                        />

                        <Grid container>
                            <Grid item container rowSpacing={1}>
                                <Grid item container spacing={1}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Tienda:</Grid>
                                    <Grid item>
                                        {dataItem.store_depots.stores.name}
                                    </Grid>
                                </Grid>

                                {
                                    dataItem.transfer_notes && (
                                        <Grid item container spacing={1}>
                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Notas:</Grid>
                                            <Grid item>
                                                {dataItem.transfer_notes}
                                            </Grid>
                                        </Grid>
                                    )
                                }

                                <Grid item container spacing={1}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
                                    <Grid item>
                                        {`${dataItem.store_depots.depots.products.name} `}
                                    </Grid>
                                </Grid>

                                {
                                    dataItem.store_depots.depots.products.description && (
                                        <Grid item container spacing={1}>
                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                            <Grid item>
                                                {dataItem.store_depots.depots.products.description}
                                            </Grid>
                                        </Grid>
                                    )
                                }

                                <Grid item container spacing={1}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                    <Grid item>
                                        {`${dataItem.store_depots.depots.products.departments.name}`}
                                    </Grid>
                                </Grid>

                                <Grid item container spacing={1}>
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Unidades:</Grid>
                                    <Grid item>
                                        {`${dataItem.units_transferred_quantity}`}
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
                                        sx={{ display: "flex", alignItems: "center" }}>
                                        {dataItem.store_depots.depots.products.characteristics.length > 0
                                            ? dataItem.store_depots.depots.products.characteristics.map((item: any) => (
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
                                                        sx={{ marginRight: "3px" }}>
                                                        <Typography variant={"caption"}
                                                            sx={{
                                                                color: "white",
                                                                fontWeight: "600"
                                                            }}>
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
                                            dataItem.store_depots.depots.products.images.length > 0
                                                ? (
                                                    <Box
                                                        sx={{
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            color: "blue"
                                                        }}
                                                        onClick={() => handleOpenImagesDialog(dataItem.store_depots.depots.products.images)}
                                                    >
                                                        {dataItem.store_depots.depots.products.images.length}

                                                        <VisibilityOutlined fontSize={"small"}
                                                            sx={{ ml: "5px" }} />
                                                    </Box>
                                                ) : "no"
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Card>
                )
            }

            return (
                <Card sx={{ padding: '10px' }}>
                    <Grid container spacing={1}>
                        <Grid item container position={'relative'}>
                            <Box component={'div'} position={'absolute'} >
                                <IconButton size='small' sx={{ padding: 0 }} onClick={() => handleClickSelected(null)} >
                                    <ArrowLeftOutlined color='primary' />
                                </IconButton>
                            </Box>

                            <Grid item marginX={'auto'} alignSelf={'center'}>
                                <Chip
                                    label={dataTransferStatus[dataItem.transferStatus].name}
                                    color={dataTransferStatus[dataItem.transferStatus].color}
                                    size='small'
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <ProductDetails />
                        </Grid>

                        {
                            dataItem.transferStatus === 1 && !sent && (
                                <Grid item xs={12}>
                                    <TransferOptions />
                                </Grid>
                            )
                        }
                    </Grid>
                </Card>
            )
        }

        const ShowNotification = ({ dataItem }: { dataItem: DataTransferReceived }) => (
            <Box component={'div'} onClick={() => handleClickSelected(dataItem)}>
                <Card sx={{ padding: "10px 10px" }} >
                    <Grid container rowSpacing={2} fontSize={14.5} >

                        <Grid item container justifyContent={'space-between'}>
                            <Grid item>

                                {`
                                    ${sent ? 'Para:' : 'De:'}
                                        ${dataItem.store_depots.stores.name}
                                `}
                            </Grid>
                            <Grid item>
                                {
                                    <Chip
                                        label={dataTransferStatus[dataItem.transferStatus].name}
                                        color={dataTransferStatus[dataItem.transferStatus].color}
                                        size='small'

                                    />
                                }
                            </Grid>
                        </Grid>

                        <Grid item container justifyContent={'space-between'}>
                            <Grid item>
                                {`${dataItem.units_transferred_quantity} unidades`}
                            </Grid>
                            <Grid item>
                                <small>
                                    {dayjs(dataItem.created_at).format('hh:mm A')}
                                </small>
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>
            </Box>

        )

        return (
            <>
                <Grid item xs={12}>
                    <Chip
                        label={dayjs(transfers[0].created_at).format('D/MM/YYYY')}
                        sx={{ width: '100%' }}
                    />
                </Grid>

                {
                    transfers.map((item: DataTransferReceived, index: number) => (
                        <Grid key={index} item xs={12}>
                            {
                                selected?.id === item.id
                                    ? <ShowTransferDetails dataItem={item} />
                                    : <ShowNotification dataItem={item} />
                            }
                        </Grid>
                    ))
                }



            </>

        )
    }

    return (
        <>
            <Card variant={'outlined'}>

                <CustomToolbar />

                <CardContent>
                    <Grid container rowSpacing={2}>
                        {
                            data.map((item: DataTransferReceived[], index: number) => (
                                <ShowTransfer key={index} transfers={item} />
                            ))
                        }
                    </Grid>


                </CardContent>
            </Card>
        </>
    )
}

export default SellerTransferMailBox
