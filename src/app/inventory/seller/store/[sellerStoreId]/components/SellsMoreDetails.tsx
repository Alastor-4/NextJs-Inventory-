import {
    Box, Button, Collapse, Dialog, DialogActions, DialogContent,
    DialogTitle, FormHelperText, Grid, IconButton, MenuItem, Table, TableBody, TableCell,
    TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { computeDepotPricePerUnit, numberFormat } from '@/utils/generalFunctions';
import { SellsMoreDetailsProps, sellProducts } from '@/types/interfaces';
import { AddOutlined, Close, Remove } from '@mui/icons-material';
import { payment_methods_enum } from '@prisma/client';
import sellerStore from '../requests/sellerStore';
import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from "yup";
import dayjs from 'dayjs';

const calcTotalPrice = ({ returnedQuantity, sellPaymentMethod }: initialValuesProps, selectedProduct: sellProducts) => {
    let sellProduct: { storeDepotId: number; unitsQuantity: number, price: number };

    const storeDepot = selectedProduct.store_depots;

    sellProduct = {
        storeDepotId: storeDepot.id,
        unitsQuantity: returnedQuantity,
        price: computeDepotPricePerUnit(storeDepot, returnedQuantity)
    };

    let totalPricePaid = 0;
    sellPaymentMethod.forEach((paymentMethod) => totalPricePaid += paymentMethod.quantity);

    const totalPrice = sellProduct.price * sellProduct.unitsQuantity;

    return { ok: totalPrice === totalPricePaid, totalPrice, sellProduct }
}

interface initialValuesProps {
    soldUnitsQuantity: number | undefined;
    returnedQuantity: number;
    returnedReason: string;
    sellPaymentMethod: {
        paymentMethod: string;
        quantity: number;
    }[];
}

const SellsMoreDetails = ({ show, sell_products, history, sell, refreshData }: SellsMoreDetailsProps) => {

    const [selectedSellProduct, setSelectedSellProduct] = useState<sellProducts | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleShowModal = (sellProduct: sellProducts) => {
        setSelectedSellProduct(sellProduct);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setIsShow(false);
        setShowLast(false);
        setSelectedSellProduct(null);
    };

    const initialValues: initialValuesProps = {
        soldUnitsQuantity: selectedSellProduct?.units_quantity,
        returnedQuantity: 0,
        returnedReason: "",
        sellPaymentMethod: [{ paymentMethod: 'EfectivoCUP', quantity: 0 }]
    }

    const validationSchema = Yup.object({
        soldUnitsQuantity: Yup.number(),
        returnedQuantity: Yup.number().integer().required("Es requerido").typeError("Debe ser un número").min(0, "Debe ser mayor a 0")
            .max(Yup.ref("soldUnitsQuantity"), "Cantidad superior a lo vendido"),
        returnedReason: Yup.string(),
        sellPaymentMethod: Yup.object().shape({
            paymentMethod: Yup.string().required('El método de pago es obligatorio').oneOf(
                [payment_methods_enum.EfectivoCUP, payment_methods_enum.TransferenciaCUP, payment_methods_enum.Otro],
                'Método de pago no válido'
            ),
            quantity: Yup.number().required('La cantidad es obligatoria').positive('La cantidad debe ser positiva'),
        })
    });

    const paymentMethods: { code: payment_methods_enum, maxQuantity: number }[] = [];
    sell.sell_payment_methods.map(({ payment_method, quantity }) => paymentMethods.push({ code: payment_method, maxQuantity: quantity }));

    const getFirstSelectOptions = (sellPaymentMethods: { paymentMethod: payment_methods_enum | string; quantity: number; }[]) => {
        const selectedMethods = [sellPaymentMethods[1]?.paymentMethod!, sellPaymentMethods[2]?.paymentMethod!];
        return paymentMethods.filter(({ code }) => !selectedMethods.includes(code));
    }
    const getSecondSelectOptions = (sellPaymentMethods: { paymentMethod: payment_methods_enum | string; quantity: number; }[]) => {
        const selectedMethods = [sellPaymentMethods[0]?.paymentMethod!, sellPaymentMethods[2]?.paymentMethod!];
        return paymentMethods.filter(({ code }) => !selectedMethods.includes(code));
    }
    const getThirdSelectOptions = (sellPaymentMethods: { paymentMethod: payment_methods_enum | string; quantity: number; }[]) => {
        const selectedMethods = [sellPaymentMethods[0]?.paymentMethod!, sellPaymentMethods[1]?.paymentMethod!];
        return paymentMethods.filter(({ code }) => !selectedMethods.includes(code));
    }

    const onSubmit = async (values: initialValuesProps) => {
        const response = await sellerStore.addReturnToSellProducts(selectedSellProduct?.store_depots.store_id!, selectedSellProduct?.id!, values.returnedQuantity, values.returnedReason, values.sellPaymentMethod);
        if (response === 200 && refreshData) await refreshData();
        handleCloseModal();
    }

    const formatMethod = (paymentMethod: payment_methods_enum | string) => {
        if (paymentMethod.includes("CUP")) {
            return paymentMethod.replace(/CUP/g, " CUP");
        }
        return paymentMethod;
    }

    const [isShow, setIsShow] = useState<boolean>(false);
    const [showLast, setShowLast] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);

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
                                    >{({ getFieldProps, isValid, errors, touched, values, resetForm }) => (
                                        <Dialog open={modalOpen} fullScreen onClose={() => { handleCloseModal(); resetForm() }}>
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
                                                        <Grid item>Unidades vendidas: {`${selectedSellProduct?.units_quantity ?? 0}`}</Grid>
                                                        <Grid item>Unidades devueltas: {`${selectedSellProduct?.units_returned_quantity ?? 0}`}</Grid>
                                                        <Grid item container spacing={2} justifyContent={"center"} marginTop={"5px"}>
                                                            {selectedSellProduct.units_quantity !== 0 ?
                                                                <Grid item container textAlign={"center"} justifyContent={"center"}>
                                                                    <Grid item xs={6}>
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
                                                                    <Grid item container xs={6}>
                                                                        <Grid item xs={12}>Valor total:</Grid>
                                                                        <Grid item xs={12}>
                                                                            {numberFormat(String(+selectedSellProduct.store_depots.sell_price! * values.returnedQuantity))}
                                                                        </Grid>
                                                                    </Grid>
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
                                                            {selectedSellProduct.units_quantity === 0 && <Grid>Devueltos en: {dayjs(selectedSellProduct.returned_at!).format('MMM D, YYYY h:mm A')}</Grid>}
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item container>
                                                        {selectedSellProduct.units_quantity !== 0 &&
                                                            <Grid item container xs={12} marginTop={"15px"}>
                                                                <Grid item xs={7}>
                                                                    <TextField
                                                                        label="Método de pago"
                                                                        size={"small"}
                                                                        fullWidth
                                                                        select
                                                                        {...getFieldProps(`sellPaymentMethod[0].paymentMethod`)}
                                                                    >
                                                                        {getFirstSelectOptions(values.sellPaymentMethod).map(({ code }) => <MenuItem key={code} value={code}>{formatMethod(code)}</MenuItem>)}
                                                                    </TextField>
                                                                </Grid>
                                                                <Grid item xs={3.5}>
                                                                    <TextField
                                                                        label="Cantidad"
                                                                        type='number'
                                                                        size={"small"}
                                                                        fullWidth
                                                                        sx={{ marginLeft: "5px" }}
                                                                        {...getFieldProps(`sellPaymentMethod[0].quantity`)}
                                                                    />
                                                                    <Grid item textAlign={"center"}>Máx: {paymentMethods.filter(method => values.sellPaymentMethod[0].paymentMethod === method.code)[0].maxQuantity}</Grid>
                                                                </Grid>
                                                                {values.sellPaymentMethod[0] && paymentMethods.filter(method => values.sellPaymentMethod[0].paymentMethod === method.code)[0].maxQuantity < values.sellPaymentMethod[0].quantity && (
                                                                    <Grid item xs={12} textAlign={"center"}>
                                                                        <FormHelperText component={"span"} sx={{ color: "#d32f2f" }}>
                                                                            Cantidad mayor a lo que se puede devolver
                                                                        </FormHelperText>
                                                                    </Grid>
                                                                )}
                                                                <Grid item xs={1.5}>
                                                                    <Grid item>
                                                                        {values.sellPaymentMethod.length === 1 &&
                                                                            <IconButton onClick={() => {
                                                                                values.sellPaymentMethod.push({ paymentMethod: getSecondSelectOptions(values.sellPaymentMethod)[0].code, quantity: 0 })
                                                                                setIsShow(true)
                                                                            }}><AddOutlined /></IconButton>
                                                                        }
                                                                        {values.sellPaymentMethod.length === 2 &&
                                                                            <IconButton onClick={() => {
                                                                                values.sellPaymentMethod.pop()
                                                                                setIsShow(false)
                                                                            }}><Remove /></IconButton>
                                                                        }
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>}
                                                        {isShow && <Grid item container xs={12} marginTop={"15px"}>
                                                            <Grid item xs={7}>
                                                                <TextField
                                                                    label="Método de pago"
                                                                    size={"small"}
                                                                    fullWidth
                                                                    select
                                                                    {...getFieldProps(`sellPaymentMethod[1].paymentMethod`)}
                                                                >
                                                                    {getSecondSelectOptions(values.sellPaymentMethod).map(({ code }) => <MenuItem key={code} value={code}>{formatMethod(code)}</MenuItem>)}
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item xs={3.5}>
                                                                <TextField
                                                                    label="Cantidad"
                                                                    type='number'
                                                                    size={"small"}
                                                                    fullWidth
                                                                    sx={{ marginLeft: "5px" }}
                                                                    {...getFieldProps(`sellPaymentMethod[1].quantity`)}
                                                                />
                                                                <Grid item textAlign={"center"}>Máx: {paymentMethods.filter(method => values.sellPaymentMethod[1].paymentMethod === method.code)[0].maxQuantity}</Grid>
                                                            </Grid>
                                                            <Grid item xs={1.5}>
                                                                <Grid item>
                                                                    {sell.sell_payment_methods.length > 2 && values.sellPaymentMethod.length === 2 &&
                                                                        <IconButton onClick={() => {
                                                                            values.sellPaymentMethod.push({ paymentMethod: getThirdSelectOptions(values.sellPaymentMethod)[0].code, quantity: 0 })
                                                                            setShowLast(true)
                                                                        }}><AddOutlined /></IconButton>
                                                                    }
                                                                    {values.sellPaymentMethod.length === 3 &&
                                                                        <IconButton onClick={() => {
                                                                            values.sellPaymentMethod.pop()
                                                                            setShowLast(false)
                                                                        }}><Remove /></IconButton>
                                                                    }
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>}
                                                        {values.sellPaymentMethod[1] && paymentMethods.filter(method => values.sellPaymentMethod[1].paymentMethod === method.code)[0].maxQuantity < values.sellPaymentMethod[1].quantity && (
                                                            <Grid item xs={12} textAlign={"center"}>
                                                                <FormHelperText component={"span"} sx={{ color: "#d32f2f" }}>
                                                                    Cantidad mayor a lo que se puede devolver
                                                                </FormHelperText>
                                                            </Grid>
                                                        )}
                                                        {showLast && <Grid item container xs={12} marginTop={"15px"}>
                                                            <Grid item xs={7}>
                                                                <TextField
                                                                    label="Método de pago"
                                                                    size={"small"}
                                                                    fullWidth
                                                                    select
                                                                    {...getFieldProps(`sellPaymentMethod[2].paymentMethod`)}
                                                                >
                                                                    {getThirdSelectOptions(values.sellPaymentMethod).map(({ code }) => <MenuItem key={code} value={code}>{formatMethod(code)}</MenuItem>)}
                                                                </TextField>
                                                            </Grid>
                                                            <Grid item xs={3.5}>
                                                                <TextField
                                                                    label="Cantidad"
                                                                    type='number'
                                                                    size={"small"}
                                                                    fullWidth
                                                                    sx={{ marginLeft: "5px" }}
                                                                    {...getFieldProps(`sellPaymentMethod[2].quantity`)}
                                                                />
                                                                <Grid item textAlign={"center"}>Máx: {paymentMethods.filter(method => values.sellPaymentMethod[2].paymentMethod === method.code)[0].maxQuantity}</Grid>
                                                            </Grid>
                                                        </Grid>}
                                                        {values.sellPaymentMethod[2] && paymentMethods.filter(method => values.sellPaymentMethod[2].paymentMethod === method.code)[0].maxQuantity < values.sellPaymentMethod[2].quantity && (
                                                            <Grid item xs={12} textAlign={"center"}>
                                                                <FormHelperText component={"span"} sx={{ color: "#d32f2f" }}>
                                                                    Cantidad mayor a lo que se puede devolver
                                                                </FormHelperText>
                                                            </Grid>
                                                        )}
                                                        {!!showError && (
                                                            <Grid item xs={12} textAlign={"center"}>
                                                                <FormHelperText component={"span"} sx={{ color: "#d32f2f" }}>
                                                                    La cantidad a devolver debe ser igual al valor total
                                                                </FormHelperText>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </DialogContent>
                                                <DialogActions sx={{ marginRight: "15px", marginTop: "5px" }}>
                                                    <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
                                                    {selectedSellProduct.units_quantity !== 0 && <Button
                                                        type='submit'
                                                        color="primary"
                                                        disabled={values.returnedQuantity <= 0 || !!errors.returnedQuantity && touched.returnedQuantity || values.returnedReason.length <= 0 || !!errors.returnedReason && touched.returnedReason}
                                                        variant="outlined"
                                                        onClick={() => {
                                                            const { ok } = calcTotalPrice(values, selectedSellProduct);
                                                            if (!ok) {
                                                                setShowError(true);
                                                            } else {
                                                                setShowError(false);
                                                                onSubmit(values);
                                                                resetForm();
                                                            }
                                                        }}
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