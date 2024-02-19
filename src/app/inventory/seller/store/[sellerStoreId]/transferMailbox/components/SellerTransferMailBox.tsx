"use client"

import {
    ArrowLeft,
    ArrowLeftOutlined,
    Cancel,
    Done,
    FilterAltOutlined,
    Money,
    VisibilityOutlined,
} from '@mui/icons-material'
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Toolbar,
    Typography
} from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import transfer from '../request/transfer'
import dayjs from 'dayjs'
import {images, stores} from '@prisma/client'
import ImagesDisplayDialog from '@/components/ImagesDisplayDialog'
import { DataTransferReceived, TransferStoreDepots } from '@/types/transfer-interfaces'
import ModalSellProducts from './ModalSellProducts'
import { notifySuccess } from "@/utils/generalFunctions";
import ModalFilter from './ModalFilter'
import {TableNoData} from "@/components/TableNoData";

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
interface AllOwnerStores extends stores {
    selected: boolean
}

function SellerTransferMailBox({ userId, storeId, sent }: SellerTransferMailboxProps) {

    const router = useRouter()

    const [dataTransfer, setDataTransfer] = useState<DataTransferReceived[]>([])
    const [data, setData] = useState<DataTransferReceived[][]>([])

    const [forceRender, setForceRender] = useState(true)

    //data for filter
    const [allOwnerStores, setAllOwnerStores] = useState<AllOwnerStores[]>([])

    //Filters
    const [showModalFilter, setShowModalFilter] = useState(false)

    //selectedFilters
    const [selectedStatus, setSelectedStatus] = useState<number[]>([])
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
    const [selectedStores, setSelectedStore] = useState<number[]>([])


    //get initial data
    useEffect(() => {
        const checkStatus = (item: DataTransferReceived) => {
            if (item.from_store_accepted && !item.to_store_accepted && !item.transfer_cancelled) return 1
            if (item.from_store_accepted && item.to_store_accepted && !item.transfer_cancelled) return 2
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

        const getAllStores = async () => {
            const dataUser = await transfer.getDataUser(storeId!, userId!)
            if (dataUser) {
                const stores: stores[] = await transfer.getAllOwnerStores(storeId!, userId!)
                setAllOwnerStores(
                    stores.map((element) => (
                        { ...element, selected: false }
                    ))
                )
            }
        }

        getAllStores()

    }, [storeId, userId,])


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

    const handleClickFilter = () => {
        setShowModalFilter(true)
    }

    const CustomToolbar = () => (
        <AppBar position={"static"} variant={"elevation"} color={"primary"}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "white" }}>
                <Box sx={{ display: "flex", alignItems: "center", overflowX: "auto" }}>
                    <IconButton color={"inherit"} sx={{ mr: "10px" }} onClick={handleNavigateBack}>
                        <ArrowLeft fontSize={"large"} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: ".2rem",
                            color: "white",
                            overflowX: "auto",
                            whiteSpace: "nowrap"
                        }}
                    >
                        Transferencias {sent ? "enviadas" : "recibidas"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex" }}>
                    <IconButton color={"inherit"} onClick={handleClickFilter}>
                        <FilterAltOutlined fontSize={"small"}/>
                    </IconButton>
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


                const handleAccept = async (remainingUnits: number) => {
                    const acceptResponse = await transfer.handleAcceptTransfer(storeId!, dataItem.id)
                    if (acceptResponse) {
                        notifySuccess("Transferencia aceptada. Producto agregado a la tienda")

                        setForceRender(true)
                    }
                }

                const handleSell = async () => {
                    const product = await transfer.getStoreDepot(storeId!, dataItem.store_depots.depots.product_id)

                    setStoreDepotDetails(product ?? dataItem.store_depots)

                    setActiveModalSell(true)
                }

                const handleCancel = async () => {
                    const cancelResponse = await transfer.handleCancelTransfer(storeId!, dataItem.id)
                    if (cancelResponse) {
                        notifySuccess("Transferencia cancelada. Producto retornado a la tienda origen")

                        setForceRender(true)
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
                            reloadData={() => setForceRender(true)}
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
                                        Dar entrada
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
                                    <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>{sent ? "Hacia: " : "Desde: "}</Grid>
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
                                    <Grid container item xs={true}
                                        sx={{ display: "flex", alignItems: "center" }}>
                                        {dataItem.store_depots.depots.products.characteristics.length > 0
                                            ? dataItem.store_depots.depots.products.characteristics.map((item: any) => (
                                                <Grid key={item.id} item xs={12}>
                                                    <Box display={"inline-flex"} mr={"5px"}>
                                                        {`${item.name.toUpperCase()} = ${item.value}`}
                                                    </Box>
                                                </Grid>

                                            )) : "-"
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
                    <Grid container rowSpacing={2} fontSize={14.5}>
                        <Grid item container justifyContent={'space-between'}>
                            <Grid item>
                                {`${sent ? 'Para:' : 'De:'} ${dataItem.store_depots.stores.name}`}
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

    const cleanFilters = () => {
        setSelectedStatus([])
        setSelectedDate(undefined)
        setSelectedStore([])

        setShowModalFilter(false)
    }
    const updateFilters = (status: number[], date: string | undefined, stores: number[]) => {
        setSelectedStatus(status)
        setSelectedDate(date)
        setSelectedStore(stores)

        setShowModalFilter(false)
    }

    const applyFilter = () => {
        let dataFilter = [...data]

        const appliedFilterDate = () => {
            const getMonth = (month: number) => { if (month < 9) return `0${month + 1}`; return month + 1 }
            const getDate = (date: number) => { if (date < 10) return `0${date}`; return date }

            dataFilter = dataFilter.filter((element) => {
                const date = dayjs(element[0].created_at)
                const dateToCompare: string = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`;
                return dateToCompare === selectedDate
            })

        }

        const appliedFilterStatus = () => {
            const newDataFilter: DataTransferReceived[][] = []

            let indexBy: { [key: number]: true } = {}
            selectedStatus.forEach((element) => indexBy[element] = true)

            dataFilter.forEach((element) => {
                const aux = element.filter((item) => indexBy[item.transferStatus])
                if (aux.length) newDataFilter.push(aux)
            })

            dataFilter = newDataFilter
        }

        const appliedFilterStore = () => {
            const newDataFilter: DataTransferReceived[][] = []

            let indexBy: { [key: number]: true } = {}
            selectedStores.forEach((element) => indexBy[element] = true)

            dataFilter.forEach((element) => {
                const aux = element.filter((item) => indexBy[item.store_depots.stores.id])
                if (aux.length) newDataFilter.push(aux)
            })

            dataFilter = newDataFilter
        }

        if (selectedDate) appliedFilterDate()
        if (selectedStatus.length) appliedFilterStatus()
        if (selectedStores.length) appliedFilterStore()

        return dataFilter
    }

    return (
        <>
            <ModalFilter
                open={showModalFilter}
                setOpen={setShowModalFilter}
                dialogTitle='Aplicar filtros'
                filterByStatus={selectedStatus}
                filterByDate={selectedDate}
                filterByStores={selectedStores}
                allStores={allOwnerStores}
                data={data}
                cleanFilters={cleanFilters}
                updateFilters={updateFilters}
            >
            </ModalFilter>

            <Card variant={'outlined'}>
                <CustomToolbar />

                <CardContent>
                    <Grid container rowSpacing={2}>
                        {
                            applyFilter().length > 0
                                ? applyFilter().map((item: DataTransferReceived[], index: number) => (
                                    <ShowTransfer key={index} transfers={item} />
                                )) : <TableNoData/>
                        }
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}

export default SellerTransferMailBox
