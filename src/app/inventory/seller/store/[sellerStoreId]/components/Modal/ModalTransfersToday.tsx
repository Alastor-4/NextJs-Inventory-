'use client'

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Button,
    Typography,
    Grid,
    TableCell,
    TableRow,
    TableHead,
    TableBody,
    Card,
    TableContainer,
    Table,
    Tooltip,
    Chip, Collapse, Box, AvatarGroup, Avatar
} from '@mui/material';
import { storeSellsDetailsProps } from '@/types/interfaces';
import React, { useState } from 'react';
import {
    Close,
    ExpandLessOutlined,
    ExpandMoreOutlined, ForwardToInbox,
    InboxOutlined,
    Mail,
    OutboundOutlined
} from '@mui/icons-material';
import { TableNoData } from '@/components/TableNoData';
import SellsMoreDetails from '../SellsMoreDetails';
import {images, product_store_transfers, store_depot_transfers} from "@prisma/client";

interface ModalTransfersTodayProps {
    isOpen: boolean;
    setIsOpen: (bool: boolean) => void;
    transfersData?: {
        warehouseAndStore: any[],
        store: any[],
    };
    storeId: number,
}

const ModalTransfersToday = ({ isOpen, setIsOpen, transfersData, storeId }: ModalTransfersTodayProps) => {
    const [showDetailsId, setShowDetailsId] = useState<number>(-1);
    const [displayStoreStoreTransfers, setDisplayStoreStoreTransfers] = useState<boolean>(true);

    const handleCloseModal = () => {
        setIsOpen(false);
    }

    const TableHeader = () => {
        const headCells = [
            { id: "expand", label: "" },
            { id: "product", label: "Producto" },
            { id: "source", label: "Fuente" },
            { id: "units", label: "Unidades" },
            { id: "status", label: "Estado" },
        ];

        return (
            <TableHead>
                <TableRow>
                    {headCells.map(headCell => (
                        <TableCell
                            key={headCell.id}
                            align={"left"}
                        >
                            {headCell.label}
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {
        return (
            <TableBody>
                {transfersData!.store.map(
                    (transferItem: any) => (
                        <React.Fragment key={transferItem.id}>
                            <TableRow
                                key={transferItem.id}
                                hover
                                tabIndex={-1}
                            >
                                <TableCell>
                                    <Tooltip title={"Detalles"}>
                                        <IconButton
                                            size={"small"}
                                            onClick={() => setShowDetailsId((showDetailsId !== transferItem.id) ? transferItem.id : -1)}
                                        >
                                            {
                                                (showDetailsId !== transferItem.id)
                                                    ? <ExpandMoreOutlined />
                                                    : <ExpandLessOutlined />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    {
                                        transferItem.store_depots.depots.products.images?.length! > 0 && (
                                            <Box display={"flex"} justifyContent={"center"}>
                                                <AvatarGroup
                                                    max={2}
                                                    sx={{ flexDirection: "row", width: "fit-content" }}
                                                >
                                                    {transferItem.store_depots.depots.products?.images?.map(
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
                                    <Box display={"flex"} justifyContent={"center"}>
                                        {transferItem.store_depots.depots.products.name}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Grid container>
                                        <Grid container item xs={12} justifyContent={"center"}>
                                            {storeId === +transferItem.to_store_id
                                                ? <Mail fontSize={"small"} color={"primary"}/>
                                                : <ForwardToInbox fontSize={"small"} color={"secondary"}/>
                                            }
                                        </Grid>

                                        <Grid container item xs={12} justifyContent={"center"}>
                                            {transferItem.stores.name}
                                        </Grid>
                                    </Grid>
                                </TableCell>
                                <TableCell>{transferItem.units_transferred_quantity}</TableCell>
                                <TableCell>
                                    <Chip
                                        variant={"outlined"}
                                        color={
                                            transferItem.to_store_accepted
                                                ? "success"
                                                : transferItem.transfer_cancelled
                                                    ? "error"
                                                    : "warning"
                                        }
                                        label={
                                            transferItem.to_store_accepted
                                                ? "Aceptada"
                                                : transferItem.transfer_cancelled
                                                    ? "Cancelada"
                                                    : "Pendiente"
                                        }
                                        size={"small"}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ padding: 0 }} colSpan={5}>
                                    <Collapse in={showDetailsId === transferItem.id} timeout="auto" unmountOnExit>
                                        <Grid container spacing={1} sx={{ padding: "8px 26px" }}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle1" gutterBottom component="div">
                                                    Detalles:
                                                </Typography>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Producto:</Grid>
                                                <Grid item xs={true}>
                                                    {transferItem.store_depots.depots.products.name}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Descripción:</Grid>
                                                <Grid item xs={true}>
                                                    {transferItem.store_depots.depots.products.description ? transferItem.store_depots.depots.products.description : "-"}
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Departamento:</Grid>
                                                <Grid item xs={true}>{transferItem.store_depots.depots.products.departments?.name ?? "-"}</Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>Características:</Grid>
                                                <Grid item xs={true} sx={{ display: "flex", alignItems: "center" }}>
                                                    {transferItem.store_depots.depots.products.characteristics.length > 0
                                                        ? transferItem.store_depots.depots.products.characteristics.map((item: any) => (
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
                                                        )) : "-"
                                                    }
                                                </Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>{storeId === +transferItem.to_store_id ? "Origen" : "Destino"}</Grid>
                                                <Grid item xs={true}>{transferItem.stores.name}</Grid>
                                            </Grid>

                                            <Grid container item spacing={1} xs={12}>
                                                <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Estado</Grid>
                                                <Grid item xs={true}>
                                                    <Chip
                                                        variant={"outlined"}
                                                        color={
                                                            transferItem.to_store_accepted
                                                                ? "success"
                                                                : transferItem.transfer_cancelled
                                                                    ? "error"
                                                                    : "warning"
                                                        }
                                                        label={
                                                            transferItem.to_store_accepted
                                                                ? "Aceptada"
                                                                : transferItem.transfer_cancelled
                                                                    ? "Cancelada"
                                                                    : "Pendiente"
                                                        }
                                                        size={"small"}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
            </TableBody>
        )
    }

    return (
        <Dialog open={isOpen} onClose={handleCloseModal} fullScreen>
            <DialogTitle
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                color={"white"}
                fontWeight={"400"}
                sx={{ bgcolor: '#1976d3' }}
            >
                Transferencias hoy

                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={handleCloseModal}
                    aria-label="close"
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers >
                <Grid item container>
                    <Grid container rowSpacing={2}>
                        {
                            !!transfersData && transfersData.store.length > 0
                                ? <TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                    <Table sx={{ width: "100%" }} size={"small"}>
                                        <TableHeader />
                                        <TableContent />
                                    </Table>
                                </TableContainer> : (
                                    <TableNoData hasData={transfersData?.store?.length!} />
                                )
                        }
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ marginRight: "15px", marginTop: "5px" }}>
                <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}
export default ModalTransfersToday