"use client"

import {
    AppBar,
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Toolbar,
    Typography
} from '@mui/material';
import {
    ArrowLeft,
    FilterAlt,
    ForwardToInbox,
    Mail
} from '@mui/icons-material';
import {warehouseTransferProps} from '@/types/interfaces';
import { TableNoData } from '@/components/TableNoData';
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import warehouseTransfers
    from "@/app/inventory/owner/warehouse/[warehouseId]/transfer-history/requests/warehouseTransfers";
import {images, stores} from "@prisma/client";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import {transactionToStore} from "@/utils/generalFunctions";
import {grey} from "@mui/material/colors";
import WarehouseTransfersFilters
    from "@/app/inventory/owner/warehouse/[warehouseId]/transfer-history/components/WarehouseTransfersFilters";

dayjs.locale("es");

const WarehouseTransferHistory = ({warehouseId, ownerStores}: {warehouseId: number, ownerStores: stores[]}) => {
    const router = useRouter();

    const [allTransfers, setAllTransfers] = useState<warehouseTransferProps[] | null>(null);

    const [storeIdFilter, setStoreIdFilter] = React.useState("")
    const [dateStartFilter, setDayStartFilter] = React.useState(dayjs().subtract(15, "day").set("hour", 0).set("minute", 0).set("second", 0).format())
    const [dateEndFilter, setDayEndFilter] = React.useState(dayjs().set("hour", 23).set("minute", 59).set("second", 59).format())

    useEffect(() => {
        const loadData = async () => {
            //las 30 days transfers for all stores
            const endDay = dayjs().set("hour", 23).set("minute", 59).set("second", 59)
            const startDay = dayjs().subtract(15, "day").set("hour", 0).set("minute", 0).set("second", 0)

            const warehouseTransfer = await warehouseTransfers.allWarehouseTransfers(
                warehouseId,
                undefined,
                startDay.format(),
                endDay.format()
            );

            if (warehouseTransfer)
                setAllTransfers(warehouseTransfer);
        }
        loadData();
    }, [warehouseId]);

    async function loadData(storeId: string, startDate: string, endDate: string) {
        setStoreIdFilter(storeId)
        setDayStartFilter(startDate)
        setDayEndFilter(endDate)

        const warehouseTransfer = await warehouseTransfers.allWarehouseTransfers(
            warehouseId,
            storeId,
            startDate,
            endDate
        );

        if (warehouseTransfer)
            setAllTransfers(warehouseTransfer);
    }

    const handleNavigateBack = () => router.back();

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
                                            ? <ForwardToInbox fontSize={"small"} color={"primary"}/>
                                            : <Mail fontSize={"small"} color={"secondary"}/>
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
                            <TableCell align='center'>
                                <Grid container>
                                    <Grid item xs={12} sx={{wordWrap: "nowrap", whiteSpace: "nowrap"}}>
                                        {dayjs(transfer.created_at).format("MMM D, YYYY")}
                                    </Grid>
                                    <Grid item xs={12}>
                                        {dayjs(transfer.created_at).format("h:mm A")}
                                    </Grid>
                                </Grid>

                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
        )
    }

    const [transfersFilterOpen, setTransfersFilterOpen] = useState<boolean>(false);
    const handleOpenTransfersFilter = () => setTransfersFilterOpen(true)
    const handleCloseTransfersFilter = () => setTransfersFilterOpen(false)

    return (
        <>
            <ImagesDisplayDialog
                open={openImageDialog}
                setOpen={setOpenImagesDialog}
                images={dialogImages}
            />

            {
                transfersFilterOpen && (
                    <WarehouseTransfersFilters
                        open={transfersFilterOpen}
                        handleClose={handleCloseTransfersFilter}
                        storeOptions={ownerStores}
                        loadData={loadData}
                        storeIdInitialValue={storeIdFilter}
                        dateStartInitialValue={dateStartFilter}
                        dateEndInitialValue={dateEndFilter}
                    />
                )
            }

            <Card variant={"outlined"}>
                <CustomToolbar />
                <CardContent>
                    <Card variant={"outlined"} sx={{ padding: "10px", marginBottom: "10px" }}>
                        <Grid container alignItems="center">
                            <Button
                                size="small"
                                sx={{
                                    color: grey[600],
                                    borderColor: grey[600],
                                    '&:hover': {
                                        borderColor: grey[800],
                                        backgroundColor: grey[200],
                                    },
                                }}
                                onClick={handleOpenTransfersFilter}
                                startIcon={<FilterAlt/>}
                                variant="outlined">
                                Aplicar filtros
                            </Button>
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