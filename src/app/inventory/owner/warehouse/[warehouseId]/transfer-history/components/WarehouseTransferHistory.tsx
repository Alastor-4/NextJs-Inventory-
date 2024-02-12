"use client"

import {
    AppBar, Avatar, AvatarGroup, Box, Card, CardContent, Grid, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    Toolbar, Typography
} from '@mui/material';
import {
    ArrowLeft,
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
import {images} from "@prisma/client";
import ImagesDisplayDialog from "@/components/ImagesDisplayDialog";
import {transactionToStore} from "@/utils/generalFunctions";

dayjs.locale("es");

const WarehouseTransferHistory = ({warehouseId}: {warehouseId: number}) => {
    const router = useRouter();

    const [allTransfers, setAllTransfers] = useState<warehouseTransferProps[] | null>(null);

    function getLast30Days() {
        const endDay = dayjs()
        const startDay = endDay.subtract(30, "day")
        return [startDay, endDay]
    }

    useEffect(() => {
        const loadData = async () => {
            const warehouseTransfer = await warehouseTransfers.allWarehouseTransfers(warehouseId);

            if (warehouseTransfer)
                setAllTransfers(warehouseTransfer);
        }
        loadData();
    }, [warehouseId]);


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