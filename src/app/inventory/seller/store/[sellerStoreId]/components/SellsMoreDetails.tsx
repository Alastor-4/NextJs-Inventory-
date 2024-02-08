import { SellsMoreDetailsProps, sellProducts } from '@/types/interfaces';
import {
    Box, Button, Collapse, Dialog, DialogActions, DialogContent,
    DialogTitle, Grid, IconButton, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography
} from '@mui/material';
import sellerStore from '../requests/sellerStore';
import { AddOutlined, Close } from '@mui/icons-material';
import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import { DateTimeField, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { esES } from '@mui/x-date-pickers/locales'
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale("es");

const SellsMoreDetails = ({ show, sell_products, history, refreshData }: SellsMoreDetailsProps) => {

    const [selectedSellProduct, setSelectedSellProduct] = useState<sellProducts | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleShowModal = (sellProduct: sellProducts) => {
        setSelectedSellProduct(sellProduct);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedSellProduct(null);
    };

    const initialValues = {
        soldUnitsQuantity: selectedSellProduct?.units_quantity,
        returnedQuantity: 0,
        returnedReason: "",
        returned_at: dayjs()
    }

    const validationSchema = Yup.object({
        soldUnitsQuantity: Yup.number(),
        returnedQuantity: Yup.number().integer().required("Es requerido").typeError("Debe ser un número").min(0, "Debe ser mayor a 0")
            .max(Yup.ref("soldUnitsQuantity"), "Cantidad superior a lo vendido"),
        returnedReason: Yup.string(),
        returned_at: Yup.date().required('La fecha es requerida')
            .test('future-date', 'La fecha no puede ser posterior a la actual', function (value) {
                return dayjs(value).isBefore(dayjs());
            }),
    })

    const onSubmit = async (values: any) => {
        const response = await sellerStore.addReturnToSellProducts(selectedSellProduct?.store_depots.store_id!, selectedSellProduct?.id!, values.returnedQuantity, values.returnedReason, values.returned_at);
        if (response === 200 && refreshData) await refreshData();
        handleCloseModal();
    }

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
                            <TableCell align="center">Unidades</TableCell>
                            <TableCell align="center">Importe</TableCell>
                            <TableCell align="center">Devoluciones</TableCell>
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
                                    {sell_product.units_quantity}
                                </TableCell>
                                <TableCell align="center">
                                    {`${sell_product.price} ${sell_product.store_depots.sell_price_unit}`}
                                </TableCell>
                                <TableCell>
                                    <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} >
                                        {sell_product.units_returned_quantity ? `${sell_product.units_returned_quantity}` : "0"}
                                        {history && <IconButton onClick={() => handleShowModal(sell_product)}>
                                            <AddOutlined />
                                        </IconButton>}
                                    </Grid>
                                    {selectedSellProduct && <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={() => { }}
                                    >{({ getFieldProps, isValid, errors, touched, values, resetForm, setFieldValue }) => (
                                        <Dialog open={modalOpen} fullWidth onClose={() => { handleCloseModal(); resetForm() }}>
                                            <DialogTitle
                                                display={"flex"}
                                                justifyContent={"space-between"}
                                                alignItems={"center"}
                                                color={"white"}
                                                fontWeight={"400"}
                                                sx={{ bgcolor: '#1976d3' }}
                                            >
                                                Agregar devolución
                                                <IconButton
                                                    edge="start"
                                                    color="inherit"
                                                    onClick={handleCloseModal}
                                                    aria-label="close"
                                                >
                                                    <Close />
                                                </IconButton>
                                            </DialogTitle>
                                            <Form>
                                                <DialogContent dividers >
                                                    <Grid item container fontSize={"20px"} display={"flex"} direction={"column"} alignItems={"center"} textAlign={"left"}>
                                                        <Grid item>Producto: {`${selectedSellProduct?.store_depots.depots?.products?.name ?? ""}`}</Grid>
                                                        <Grid item>Cantidad vendida: {`${selectedSellProduct?.units_quantity ?? 0}`}</Grid>
                                                        <Grid item>Cantidad devuelta: {`${selectedSellProduct?.units_returned_quantity ?? 0}`}</Grid>
                                                        <Grid item container spacing={2} justifyContent={"center"} marginTop={"5px"}>
                                                            {selectedSellProduct.units_quantity !== 0 ?
                                                                <Grid item>
                                                                    <TextField
                                                                        label="A devolver"
                                                                        size={"small"}
                                                                        type={"number"}
                                                                        sx={{ width: "90px" }}
                                                                        {...getFieldProps("returnedQuantity")}
                                                                        error={!!errors.returnedQuantity && touched?.returnedQuantity}
                                                                        helperText={(errors.returnedQuantity && touched.returnedQuantity) && errors.returnedQuantity}
                                                                    />
                                                                </Grid>
                                                                : <Grid>Ya se devolvieron todos los productos</Grid>}
                                                            {selectedSellProduct.units_quantity !== 0 ?
                                                                <Grid item>
                                                                    <TextField
                                                                        label="Razón de la devolución"
                                                                        size={"small"}
                                                                        {...getFieldProps("returnedReason")}
                                                                        error={!!errors.returnedReason && touched.returnedReason}
                                                                        helperText={(errors.returnedReason && touched.returnedReason) && errors.returnedReason}
                                                                    />
                                                                </Grid>
                                                                : <Grid>Razón de las devoluciones: {selectedSellProduct.returned_reason}</Grid>}
                                                            {selectedSellProduct.units_quantity !== 0 ?
                                                                <Grid item>
                                                                    <LocalizationProvider
                                                                        dateAdapter={AdapterDayjs}
                                                                        localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                                                                        adapterLocale='es'>
                                                                        <DemoContainer components={['DateTimeField']}>
                                                                            <DateTimeField
                                                                                label="Fecha de la devolución"
                                                                                value={values.returned_at}
                                                                                onChange={(value) => { setFieldValue("returned_at", value) }}
                                                                                format="L hh:mm a"
                                                                            />
                                                                            {!!errors.returned_at && !touched.returned_at ? (
                                                                                <Typography color={"red"}>{`${errors?.returned_at!}`}</Typography>
                                                                            ) : null}
                                                                        </DemoContainer>
                                                                    </LocalizationProvider>
                                                                </Grid>
                                                                : <Grid>Devueltos en: {dayjs(selectedSellProduct.returned_at!).format('MMM D, YYYY h:mm A')}</Grid>}
                                                        </Grid>
                                                    </Grid>
                                                </DialogContent>
                                                <DialogActions sx={{ marginRight: "15px", marginTop: "5px" }}>
                                                    <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
                                                    {selectedSellProduct.units_quantity !== 0 && <Button
                                                        type='submit'
                                                        color="primary"
                                                        disabled={!isValid || !!errors.returnedQuantity && touched.returnedQuantity || !!errors.returned_at && !!touched.returned_at}
                                                        variant="outlined"
                                                        onClick={() => { onSubmit(values) }}
                                                    >Agregar</Button>}
                                                </DialogActions>
                                            </Form>
                                        </Dialog>)}
                                    </Formik>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Collapse >)
}

export default SellsMoreDetails