import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { SellsReceivableMoreDetailsProps } from '@/types/interfaces';
import React from 'react';

const SellsReceivableMoreDetails = ({ show, sell_receivable_products }: SellsReceivableMoreDetailsProps) => {

    return (
        <Collapse in={show} unmountOnExit>
            <Box sx={{ margin: 2 }}>
                <Typography variant='subtitle1' >
                    Detalles de la venta por cobrar:
                </Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">No.</TableCell>
                            <TableCell align="center">Producto</TableCell>
                            <TableCell align="center">Departamento</TableCell>
                            <TableCell align="center">Almacén</TableCell>
                            <TableCell align="center">Unidades</TableCell>
                            <TableCell align="center">Importe</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sell_receivable_products.map((sell_receivable_product, index) => (
                            <TableRow key={sell_receivable_product.id}>
                                <TableCell component="th" scope="row" align='center'>
                                    {index + 1}
                                </TableCell>
                                <TableCell component="th" scope="row" align='center'>
                                    {sell_receivable_product.store_depots.depots?.products?.name}
                                </TableCell>
                                <TableCell align='center'>
                                    {sell_receivable_product.store_depots.depots?.products?.departments?.name}
                                </TableCell>
                                <TableCell align='center' sx={{ whiteSpace: "nowrap" }}>
                                    {sell_receivable_product.store_depots.depots?.warehouses?.name}
                                </TableCell>
                                <TableCell align="center">
                                    {sell_receivable_product.units_quantity}
                                </TableCell>
                                <TableCell align="center">
                                    {`${sell_receivable_product.price} ${sell_receivable_product.store_depots.sell_price_unit}`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Collapse >)
}

export default SellsReceivableMoreDetails