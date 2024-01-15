'use client'

import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Typography, Grid, TableCell, TableRow, TableHead, TableBody, Card, TableContainer, Table, Tooltip } from '@mui/material';
import { ModalSellsTodayProps, storeSellsDetailsProps } from '@/types/interfaces';
import React, { useState } from 'react';
import { Close, ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { TableNoData } from '@/components/TableNoData';
import SellsMoreDetails from '../SellsMoreDetails';

const ModalSellsToday = ({ isOpen, setIsOpen, dialogTitle, todaySellsData }: ModalSellsTodayProps) => {

    const [showDetails, setShowDetails] = useState<number>(-1);

    const handleCloseModal = () => {
        setIsOpen(false);
    }

    if (!todaySellsData) {
        setIsOpen(false);
        return;
    }

    const TableHeader = () => {
        const headCells = [
            { id: "details", label: "", },
            { id: "total_price", label: "Precio total", },
            { id: "payment_method", label: "Método de pago", },
            { id: "sell_products_quantity", label: "Productos vendidos", },
            // { id: "units_returned_quantity", label: "Cantidad de unidades devueltas", },
            // { id: "returned_reason", label: "Razón de la devolución", },
            // { id: "reservations", label: "Reservaciones", },
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
                {todaySellsData?.map(
                    (sell: storeSellsDetailsProps) => (
                        <React.Fragment key={sell.id}>
                            <TableRow
                                key={sell.id}
                                hover
                                tabIndex={-1}
                            >
                                <TableCell>
                                    <Tooltip title={"Detalles"}>
                                        <IconButton
                                            size={"small"}
                                            onClick={() => setShowDetails((showDetails !== sell.id) ? sell.id : -1)}
                                        >
                                            {
                                                (showDetails !== sell.id)
                                                    ? <ExpandMoreOutlined />
                                                    : <ExpandLessOutlined />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{sell.total_price}</TableCell>
                                <TableCell>{sell.payment_method}</TableCell>
                                <TableCell>{sell.sell_products.length!}</TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ padding: 0 }} colSpan={6}>
                                    {showDetails === sell.id && (
                                        <SellsMoreDetails
                                            show={(showDetails === sell.id)}
                                            sell_products={sell.sell_products}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
            </TableBody>
        )
    }

    return (
        <Dialog open={isOpen} fullWidth onClose={handleCloseModal}>
            <DialogTitle
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                color={"white"}
                fontWeight={"400"}
                sx={{ bgcolor: '#1976d3' }}
            >
                {dialogTitle}
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
                    <Grid item xs={12} display={"flex"} alignItems={"center"}>
                        <Typography variant='h6'>
                            Ventas efectuadas: {todaySellsData.length!}
                        </Typography>
                    </Grid>
                    <Card variant={"outlined"} sx={{ paddingTop: "20px", marginTop: "10px" }}>
                        <Grid container rowSpacing={2}>
                            {
                                todaySellsData?.length! > 0
                                    ? <TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />
                                            <TableContent />
                                        </Table>
                                    </TableContainer> : (
                                        <TableNoData hasData={todaySellsData?.length!} />
                                    )
                            }
                        </Grid>
                    </Card>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ marginRight: "15px", marginTop: "5px" }}>
                <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}
export default ModalSellsToday