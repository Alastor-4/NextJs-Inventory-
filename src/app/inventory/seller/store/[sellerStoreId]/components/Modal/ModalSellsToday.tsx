'use client'

import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Button, Typography, Grid, TableCell, TableRow,
    TableHead, TableBody, Card, TableContainer, Table, Tooltip
} from '@mui/material';
import { Close, ExpandLessOutlined, ExpandMoreOutlined } from '@mui/icons-material';
import { ModalSellsTodayProps, storeSellsDetailsProps } from '@/types/interfaces';
import calcReturnedQuantity from '@/utils/calcReturnedQuantity';
import { TableNoData } from '@/components/TableNoData';
import SellsMoreDetails from '../SellsMoreDetails';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import calcSellProductsUnits from '@/utils/calcSellProductsUnits';

dayjs.locale("es");

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
        return (
            <TableHead>
                <TableRow>
                    <TableCell id='details' />
                    <TableCell align='center' id='total_price_payment_method'>Importe total</TableCell>
                    <TableCell align='center' id='sell_products_quantity'>Productos</TableCell>
                    <TableCell align='center' id='units'>Unidades</TableCell>
                    <TableCell align='center' id='sell_units_returned_quantity'>Devoluciones</TableCell>
                    <TableCell align='center' id='created_at'>Registrado</TableCell>
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
                                <TableCell align='center'>{sell.total_price} <br /> {sell.payment_method}</TableCell>
                                <TableCell align='center'>{sell.sell_products.length! !== 1 ? sell.sell_products.length! : sell.sell_products[0].store_depots.depots?.products?.name}</TableCell>
                                <TableCell align='center'>{`${calcSellProductsUnits(sell)}`}</TableCell>
                                <TableCell align='center'>{`${calcReturnedQuantity(sell)}`}</TableCell>
                                <TableCell align='center'>{dayjs(sell.created_at).format('h:mm A')}</TableCell>
                            </TableRow>
                            <TableRow >
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
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
                        <Typography variant='h6'>Ventas efectuadas: {todaySellsData.length!}</Typography>
                    </Grid>
                    <Card variant={"outlined"} sx={{ paddingTop: "20px", width: "110%", marginTop: "10px", mx: "-15px" }}>
                        <Grid container rowSpacing={2}>
                            {
                                todaySellsData?.length! > 0
                                    ? <TableContainer sx={{ width: "100%", maxHeight: "70vh", overflowX: "auto" }}>
                                        <Table sx={{ width: "100%" }} size={"small"}>
                                            <TableHeader />
                                            <TableContent />
                                        </Table>
                                    </TableContainer> :
                                    <TableNoData hasData={todaySellsData?.length!} />
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