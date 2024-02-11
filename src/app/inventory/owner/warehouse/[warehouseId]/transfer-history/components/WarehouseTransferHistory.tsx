import {
    AppBar, Avatar, AvatarGroup, Box, Card, CardContent, Grid, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Toolbar, Typography
} from '@mui/material';
import { DatePicker, DateValidationError, LocalizationProvider, PickerChangeHandlerContext } from '@mui/x-date-pickers';
import {
    ArrowLeft,
    ForwardToInbox,
    HelpOutline,
    Mail
} from '@mui/icons-material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {warehouseTransferProps} from '@/types/interfaces';
import { TableNoData } from '@/components/TableNoData';
import InfoTooltip from '@/components/InfoTooltip';
import React, { useEffect, useState } from 'react';
import { esES } from '@mui/x-date-pickers/locales'
import { useRouter } from "next/navigation";
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import warehouseTransfers
    from "@/app/inventory/owner/warehouse/[warehouseId]/transfer-history/requests/warehouseTransfers";
import {images} from "@prisma/client";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import {transactionToStore} from "@/utils/generalFunctions";

dayjs.locale("es");

const getMonth = (month: number) => { if (month < 9) return `0${month + 1}`; return month + 1 }
const getDate = (date: number) => { if (date < 10) return `0${date}`; return date }

const WarehouseTransferHistory = ({warehouseId}: {warehouseId: number}) => {
    const router = useRouter();

    const [allTransfers, setAllTransfers] = useState<warehouseTransferProps[] | null>(null);
    const [sellDates, setSellDates] = useState<string[] | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>();

    const handleChange = (value: unknown, context: PickerChangeHandlerContext<DateValidationError>) => {
        if (value === null) { setSelectedDate(undefined); return }
        const date = value as Dayjs;
        const selectedDate = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`
        setSelectedDate(selectedDate);
    };

    useEffect(() => {
        const loadData = async () => {
            const warehouseTransfer = await warehouseTransfers.allWarehouseTransfers(warehouseId);

            if (warehouseTransfer)
                setAllTransfers(warehouseTransfer);
        }
        loadData();
    }, [warehouseId]);

    const refreshData = async () => {
        const storeAllSellsDetails = await warehouseTransfers.allWarehouseTransfers(warehouseId);
        setAllTransfers(storeAllSellsDetails);
    }

    const handleNavigateBack = () => router.back();

    const [showDetails, setShowDetails] = useState<number>(-1);

    const [isOpenTooltip, setIsOpenTooltip] = useState<boolean>(false);
    const handleTooltipClose = () => setIsOpenTooltip(false);
    const handleTooltipOpen = () => setIsOpenTooltip(true);

    const hasSell = (date: Dayjs): boolean => {
        const dateToCompare: string = `${date.get("year")}-${getMonth(date.get('month'))}-${getDate(date.get('date'))}`;
        if (sellDates) {
            return !sellDates?.includes(dateToCompare);
        }
        return true;
    }

    //Image handlers
    const [openImageDialog, setOpenImagesDialog] = useState<boolean>(false);
    const [dialogImages, setDialogImages] = useState<images[] | null>(null);

    const handleOpenImagesDialog = (images: images[]) => {
        setDialogImages(images);
        setOpenImagesDialog(true);
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
                        noWrap
                        sx={{
                            fontWeight: 700,
                            color: "white",
                        }}
                    >
                        Transferencias
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    )

    const TableHeader = () => {
        return (
            <TableHead>
                <TableRow>
                    <TableCell align='center' id='name'>Producto</TableCell>
                    <TableCell align='center' id='source'>Fuente</TableCell>
                    <TableCell align='center' id='units'>Unidades</TableCell>
                    <TableCell align='center' id='maker'>Creador</TableCell>
                    <TableCell align='center' id='created_at'>Fecha</TableCell>
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {

        return (
            <TableBody>
                {allTransfers?.map(
                    (transfer: warehouseTransferProps) => (
                        <TableRow
                            key={transfer.id}
                            hover
                            tabIndex={-1}
                        >
                            <TableCell align='center'>
                                {
                                    transfer.store_depots.depots?.products?.images?.length! > 0 && (
                                        <Box display={"flex"} justifyContent={"center"}>
                                            <AvatarGroup
                                                max={2}
                                                sx={{ flexDirection: "row", width: "fit-content" }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleOpenImagesDialog(transfer.store_depots.depots!.products!.images!)
                                                }}
                                            >
                                                {transfer.store_depots.depots!.products!.images!.map(
                                                    (imageItem: images) => <Avatar
                                                        variant={"rounded"}
                                                        key={`producto-${imageItem.id}`}
                                                        alt={`producto-${imageItem.id}`}
                                                        src={imageItem.fileUrl!}
                                                        sx={{ cursor: "pointer", border: "1px solid lightblue" }}
                                                    />
                                                )}
                                            </AvatarGroup>
                                        </Box>
                                    )
                                }
                                <Box display={"flex"} justifyContent={"center"}>{transfer.store_depots.depots!.products!.name}</Box>
                            </TableCell>
                            <TableCell align='center'>
                                <Grid container>
                                    <Grid container item xs={12} justifyContent={"center"}>
                                        {transfer.transfer_direction === transactionToStore
                                            ? <Mail fontSize={"small"} color={"primary"}/>
                                            : <ForwardToInbox fontSize={"small"} color={"secondary"}/>
                                        }
                                    </Grid>

                                    <Grid container item xs={12} justifyContent={"center"}>
                                        {transfer.transfer_direction === transactionToStore ? "Destino:" : "Origen:"}
                                        {transfer.store_depots.stores?.name!}
                                    </Grid>
                                </Grid>
                            </TableCell>
                            <TableCell align='center'>{transfer.units_transferred_quantity}</TableCell>
                            <TableCell align='center'>{transfer.created_by_user.name}</TableCell>
                            <TableCell align='center'>{dayjs(transfer.created_at).format()}</TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        )
    }

    return (
        <>
            <ImagesDisplayDialog
                open={openImageDialog}
                setOpen={setOpenImagesDialog}
                images={dialogImages}
            />

            <Card variant={"outlined"}>
                <CustomToolbar />
                <CardContent>
                    <Card variant={"outlined"} sx={{ padding: "10px", marginBottom: "10px" }}>
                        <Grid item container alignItems="center" justifyContent="center" sx={{ marginTop: "-10px" }}>
                            <Grid container item xs={"auto"} alignItems={"center"} >
                                <Typography variant="subtitle1" sx={{ fontWeight: "400" }}>Búsqueda avanzada</Typography>
                            </Grid>
                            <Grid container item xs={"auto"} alignItems={"center"}>
                                <InfoTooltip
                                    isOpenTooltip={isOpenTooltip}
                                    handleTooltipClose={handleTooltipClose}
                                    message={"Puede buscar por fecha de venta"}
                                >
                                    <IconButton onClick={handleTooltipOpen}>
                                        <HelpOutline />
                                    </IconButton>
                                </InfoTooltip>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} mx={"40px"}>
                            <LocalizationProvider
                                dateAdapter={AdapterDayjs}
                                localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                                adapterLocale='es'>
                                <DemoContainer components={['DatePicker']}>
                                    <DatePicker
                                        disabled={sellDates?.length! > 0 ? false : true}
                                        slotProps={{ field: { clearable: true }, toolbar: { hidden: true } }}
                                        label="Seleccione una fecha" disableFuture shouldDisableDate={hasSell} onChange={handleChange} />
                                </DemoContainer>
                            </LocalizationProvider>
                        </Grid>
                    </Card>
                    <Card variant={"outlined"} sx={{ paddingTop: "20px", mx: "-5px" }}>
                        {
                            allTransfers?.length! > 0 ?
                                (<TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                    <Table sx={{ width: "100%" }} size={"small"}>
                                        <TableHeader />
                                        <TableContent />
                                    </Table>
                                </TableContainer>)
                                : ( <TableNoData hasData={allTransfers?.length!} />)
                        }
                    </Card>
                </CardContent>
            </Card >
        </>
    )
}

export default WarehouseTransferHistory