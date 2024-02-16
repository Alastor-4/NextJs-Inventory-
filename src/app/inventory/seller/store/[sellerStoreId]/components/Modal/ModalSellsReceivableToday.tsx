'use client'

import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Button, Typography, Grid, TableCell, TableRow,
    TableHead, TableBody, Card, TableContainer, Table, Tooltip, Chip
} from '@mui/material';
import { ModalSellsReceivableTodayProps, storeSellsReceivableDetailsProps } from '@/types/interfaces';
import calcSellReceivableProductsUnits from '@/utils/calcSellReceivableProductsUnits';
import { Close, ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import SellsReceivableMoreDetails from '../SellsReceivableMoreDetails';
import formatPaymentMethods from '@/utils/getFormattedPaymentMethod';
import { getColorByStatus } from '@/utils/getColorByStatus';
import { TableNoData } from '@/components/TableNoData';
import React, { useState } from 'react';
import dayjs from 'dayjs';

dayjs.locale("es");

const ModalSellsReceivableToday = ({ isOpen, setIsOpen, dialogTitle, todaySellsReceivableData }: ModalSellsReceivableTodayProps) => {

    const [showDetails, setShowDetails] = useState<number>(-1);

    const handleCloseModal = () => {
        setIsOpen(false);
    }

    if (!todaySellsReceivableData) {
        setIsOpen(false);
        return;
    }

    const TableHeader = () => {
        return (
            <TableHead>
                <TableRow>
                    <TableCell id='details' />
                    <TableCell align='center' id='status'>Estado</TableCell>
                    <TableCell align='center' id='pay_before'>Pagar antes de</TableCell>
                    <TableCell align='center' id='total_price_payment_method'>Importe total</TableCell>
                    <TableCell align='center' id='sell_products_quantity'>Productos</TableCell>
                    <TableCell align='center' id='units'>Unidades</TableCell>
                    <TableCell align='center' id='created_at'>Registrado</TableCell>
                </TableRow>
            </TableHead>
        )
    }

    const TableContent = () => {
        return (
            <TableBody>
                {todaySellsReceivableData?.map(
                    (sell: storeSellsReceivableDetailsProps) => (
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
                                <TableCell align='center'><Chip
                                    size={"small"}
                                    label={sell.status}
                                    color={getColorByStatus(sell.status)}
                                    sx={{ border: "1px solid lightGreen" }}
                                /></TableCell>
                                {sell.sell_payment_methods.length > 0 ?
                                    <TableCell align='center' >{formatPaymentMethods(sell.sell_payment_methods!)}</TableCell>
                                    : <TableCell align='center'>{sell.total_price} <br /> {sell.payment_method}</TableCell>
                                }
                                <TableCell align='center'>{dayjs(sell.pay_before_date).format('MMM D, YYYY')}</TableCell>
                                <TableCell align='center'>{sell.sell_receivable_products.length! !== 1 ? sell.sell_receivable_products.length! : sell.sell_receivable_products[0].store_depots.depots?.products?.name}</TableCell>
                                <TableCell align='center'>{`${calcSellReceivableProductsUnits(sell)}`}</TableCell>
                                <TableCell align='center'>{dayjs(sell.created_at).format('h:mm A')}</TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                                    {showDetails === sell.id && (
                                        <SellsReceivableMoreDetails
                                            show={(showDetails === sell.id)}
                                            sell_receivable_products={sell.sell_receivable_products}
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
        <Dialog open={isOpen} fullScreen onClose={handleCloseModal}>
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
                    <Grid item xs={12} display={"flex"} justifyContent={"center"}>
                        <Typography variant='h6'>Ventas por cobrar creadas hoy: {todaySellsReceivableData.length!}</Typography>
                    </Grid>
                    <Card variant={"outlined"} sx={{ paddingTop: "20px", width: "110%", marginTop: "10px", mx: "-15px" }}>
                        <Grid container rowSpacing={2}>
                            {
                                todaySellsReceivableData?.length! > 0
                                    ? <TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />
                                            <TableContent />
                                        </Table>
                                    </TableContainer> :
                                    <TableNoData hasData={todaySellsReceivableData?.length!} />
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
export default ModalSellsReceivableToday