import { SellsMoreDetailsProps } from '@/types/interfaces';
import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import React from 'react';

const SellsMoreDetails = ({ show, sell_products }: SellsMoreDetailsProps) => {

    return (
        <Collapse in={show} unmountOnExit>
            <Box sx={{ margin: 2 }}>
                <Typography variant='subtitle1' >
                    Detalles de la venta:
                </Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">No.</TableCell>
                            <TableCell align="center">Producto</TableCell>
                            <TableCell align="center">Departamento</TableCell>
                            <TableCell align="center">Almacén</TableCell>
                            <TableCell align="center">Descripción</TableCell>
                            <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>Precio por unidad</TableCell>
                            <TableCell align="center">Unidades</TableCell>
                            <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>Total vendido</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sell_products.map((sell_product, index) => (
                            <TableRow key={sell_product.id}>
                                <TableCell component="th" scope="row" align='center'>
                                    {index + 1}
                                </TableCell>
                                <TableCell component="th" scope="row" align='center'>
                                    {sell_product.store_depots.depots?.products?.name}
                                </TableCell>
                                <TableCell align='center'>
                                    {sell_product.store_depots.depots?.products?.departments?.name}
                                </TableCell>
                                <TableCell align='center' sx={{ whiteSpace: "nowrap" }}>
                                    {sell_product.store_depots.depots?.warehouses?.name}
                                </TableCell>
                                <TableCell align="center">
                                    {sell_product.store_depots.depots?.products?.description}
                                </TableCell>
                                <TableCell align="center">
                                    {!!sell_product.store_depots.price_discount_quantity ?
                                        `${(sell_product.store_depots.sell_price - sell_product.store_depots.price_discount_quantity)} ${sell_product.store_depots.sell_price_unit}`
                                        :
                                        !!sell_product.store_depots.price_discount_percentage ?
                                            `${(sell_product.store_depots.sell_price / 100) * (100 - sell_product.store_depots.price_discount_percentage)} ${sell_product.store_depots.sell_price_unit}`
                                            :
                                            `${sell_product.store_depots.sell_price} ${sell_product.store_depots.sell_price_unit}`
                                    }
                                </TableCell>
                                <TableCell align="center">
                                    {sell_product.units_quantity}
                                </TableCell>
                                <TableCell align="center">
                                    {`${sell_product.price} ${sell_product.store_depots.sell_price_unit}`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Collapse>
    )
}

export default SellsMoreDetails