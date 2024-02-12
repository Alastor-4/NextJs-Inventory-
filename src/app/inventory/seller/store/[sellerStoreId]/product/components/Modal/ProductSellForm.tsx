//@ts-nocheck
"use client"

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormHelperText, Grid, IconButton, MenuItem, TextField } from '@mui/material';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { computeDepotPricePerUnit, notifySuccess, numberFormat } from '@/utils/generalFunctions';
import { ProductSellFormProps, productsProps } from '@/types/interfaces';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import sellerStoreProduct from '../../requests/sellerStoreProduct';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { esES } from '@mui/x-date-pickers/locales'
import { Formik } from 'formik';
import * as Yup from "yup";
import 'dayjs/locale/es';

interface Product {
    maxUnitsQuantity: number;
    unitsQuantity: number;
}

interface initialValuesProps {
    products: {
        maxUnitsQuantity: number;
        unitsQuantity: number;
    }[];
    paymentMethod?: string;
    description?: string;
    payBefore?: Date;
}

const ProductSellForm = ({ isModalOpen, storeId, setIsOpen, isReceivable, selectedProducts, allProductsByDepartment, setAllProductsByDepartment, setSelectedProducts, }: ProductSellFormProps) => {

    const handleClose = () => {
        setIsOpen(false);
    };


    const createFormValues = (products: productsProps[]) => {
        const productsArray = products.map((product) =>
            ({ maxUnitsQuantity: product.depots![0].store_depots![0].product_remaining_units!, unitsQuantity: 1 })
        );

        return {
            products: productsArray,
            paymentMethod: "",
            description: "",
            payBefore: undefined,
        };
    }
    const [initialValues, setInitialValues] = useState<initialValuesProps>(createFormValues(selectedProducts));

    const paymentMethods = useMemo(() => ["Efectivo CUP", "Transferencia CUP"], []);
    // const paymentMethods = useMemo(() => ["Efectivo CUP", "Transferencia CUP", "Otro"], []);

    useEffect(() => {
        const handleOpenModal = () => {
            let productsData: Product[] = [];
            selectedProducts.forEach((productSelected: productsProps) => {
                const storeDepot = productSelected.depots![0].store_depots![0];
                productsData.push({
                    maxUnitsQuantity: storeDepot.product_remaining_units!,
                    unitsQuantity: 1,
                })
            });

            if (isReceivable) {
                setInitialValues({
                    products: [...productsData],
                    description: "",
                    payBefore: new Date(),
                    paymentMethod: paymentMethods[0],
                })
            } else {
                setInitialValues({
                    products: [...productsData],
                    paymentMethod: paymentMethods[0],
                })
            }
        }
        handleOpenModal();
    }, [paymentMethods, selectedProducts, isReceivable]);

    const sellValidationSchema = Yup.object<{
        products: Product[];
        paymentMethod: string;
    }>({
        products: Yup.array().of(
            Yup.object<Product>({
                maxUnitsQuantity: Yup.number().integer().typeError("Debe ser un número"),
                unitsQuantity: Yup
                    .number().integer().typeError("Debe ser un número")
                    .required("Requerido")
                    .min(1, "Al menos 1")
                    .max(Yup.ref("maxUnitsQuantity"), "Cantidad superior a lo disponible"),
            })).required(),
        paymentMethod: Yup.string().required("Especifique método")
    });

    const sellReceivableValidationSchema = Yup.object<{
        products: {}[];
        paymentMethod: string;
        description: string;
        payBefore: Date;
    }>({
        products: Yup.array().of(Yup.object<Product>({
            maxUnitsQuantity: Yup.number().integer().typeError("Debe ser un número"),
            unitsQuantity: Yup
                .number().integer().typeError("Debe ser un número")
                .required("Requerido")
                .min(1, "Al menos 1")
                .max(Yup.ref("maxUnitsQuantity"), "Cantidad superior a lo disponible"),
        })).required(),
        paymentMethod: Yup.string().required("Especifique método"),
        description: Yup.string().required("Especifique datos de la venta a pagar"),
        payBefore: Yup.date().required("Este dato es requerido")
    });

    const handleSell = async (values: initialValuesProps) => {
        let sellProduct: { storeDepotId: number; unitsQuantity: number, price: number }[] = [];

        values.products.forEach(({ unitsQuantity }: Product, index: number) => {
            const storeDepot = selectedProducts[index].depots![0].store_depots![0];
            sellProduct.push({
                storeDepotId: storeDepot.id,
                unitsQuantity: unitsQuantity,
                price: computeDepotPricePerUnit(storeDepot, unitsQuantity) * unitsQuantity
            });
        });

        const totalPrice = sellProduct.reduce((accumulate, current) => accumulate + current.price, 0);
        const sell = { paymentMethod: values.paymentMethod!, totalPrice: totalPrice };
        const data = { sellerStoreId: storeId, sellData: sell, sellProductsData: sellProduct };

        let sellItemResponse;
        if (isReceivable) {
            const sellReceivableData = { description: values.description!, payBefore: values.payBefore! }
            const newData = { ...data!, sellReceivableData }
            sellItemResponse = await sellerStoreProduct.createSellReceivable(newData);
        } else {
            sellItemResponse = await sellerStoreProduct.sellStoreDepotManual(data);
        }

        if (sellItemResponse) {
            const newDepartments = [...allProductsByDepartment!];

            sellProduct.forEach(sellProductItem => {
                for (const productsByDepartments of allProductsByDepartment!) {
                    const departmentIndex = allProductsByDepartment!.indexOf(productsByDepartments);

                    const productIndex = productsByDepartments.products!.findIndex((product: productsProps) => product.depots![0].store_depots![0].id === sellProductItem.storeDepotId);
                    if (productIndex > -1) {
                        newDepartments[departmentIndex].products![productIndex].depots![0].store_depots![0].product_remaining_units
                            = allProductsByDepartment![departmentIndex].products![productIndex].depots![0].store_depots![0].product_remaining_units! - sellProductItem.unitsQuantity;
                    }
                }
            })
            setAllProductsByDepartment(newDepartments);
            notifySuccess(isReceivable ? "Venta por cobrar registrada" : "La venta ha sido registrada");
        }
        setSelectedProducts([]);
        handleClose()
    }

    const getTotals = (products: Product[]) => {
        let totalProducts = 0
        let totalPrice = 0

        products.forEach(({ unitsQuantity }, index: number) => {
            totalProducts += unitsQuantity;
            const storeDepot = selectedProducts[index].depots![0].store_depots![0];
            const pricePerUnit = computeDepotPricePerUnit(storeDepot, unitsQuantity);
            totalPrice += (pricePerUnit * unitsQuantity);
        })
        return { totalProducts, totalPrice }
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={isReceivable ? sellReceivableValidationSchema : sellValidationSchema}
            onSubmit={() => { }}
        >
            {
                ({ values, errors, resetForm, setFieldValue, touched, getFieldProps }) => (
                    <Dialog open={isModalOpen} fullScreen onClose={handleClose}>
                        <DialogTitle
                            display={"flex"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                            color={"white"}
                            padding={{ xs: "10px" }}
                            sx={{ bgcolor: '#1976d3' }}
                        >
                            <Grid item container >
                                <Grid item xs={10} textAlign={"center"}>
                                    {isReceivable ? "Crear venta por cobrar" : "Vender productos"}
                                </Grid>
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    onClick={handleClose}
                                    aria-label="close"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Grid>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container padding={"10px"}>
                                <Grid item xs={7}>Producto:</Grid>
                                <Grid item xs={3}>Cantidad:</Grid>
                                <Grid item xs={2}>Precio:</Grid>
                                <Grid item xs={12}>  <Divider sx={{ height: "5px", width: "100%" }} component={"div"} /></Grid>
                                {
                                    values.products.map(({ unitsQuantity }: Product, index: number) => {
                                        const storeDepot = selectedProducts[index].depots![0].store_depots![0];
                                        const pricePerUnit: number = computeDepotPricePerUnit(storeDepot, unitsQuantity);
                                        return (
                                            <Grid container item xs={12} key={selectedProducts[index].id} alignItems={'center'}>
                                                <Grid item xs={7} >
                                                    <Grid item >{selectedProducts[index].name}</Grid>
                                                </Grid>
                                                <Grid item xs={3} justifyContent={"center"}>
                                                    <TextField
                                                        variant='standard'
                                                        size={"small"}
                                                        type={"number"}
                                                        sx={{ width: "50px", marginLeft: "10px" }}
                                                        {...getFieldProps(`products.${index}.unitsQuantity`)}
                                                        error={!!errors.products}
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Grid item xs={"auto"} textAlign={"center"}>
                                                        {numberFormat(String(pricePerUnit * unitsQuantity))}
                                                    </Grid>
                                                </Grid>
                                                {!!errors.products && (
                                                    <Grid item xs={12} textAlign={"center"}>
                                                        <FormHelperText component={"span"} sx={{ color: "#d32f2f" }}>
                                                            {errors.products[index]?.unitsQuantity}
                                                        </FormHelperText>
                                                    </Grid>
                                                )}
                                                <Grid item xs={12}><Divider sx={{ height: "5px", width: "100%" }} component={"div"} /></Grid>

                                                <Grid container item xs={true} alignItems={"center"}>
                                                    <Divider sx={{ width: 1 }} />
                                                </Grid>
                                            </Grid>
                                        )
                                    })
                                }
                                <Grid container item xs={12} mt={"5px"}>
                                    <Grid item xs={9}>

                                    </Grid>
                                    <Grid container item xs={3}>
                                        Total: {numberFormat(String(getTotals(values.products).totalPrice))}
                                    </Grid>
                                </Grid>
                                <Grid item container>
                                    <Grid item xs={12} marginTop={"15px"}>
                                        <TextField
                                            label="Método de pago"
                                            size={"small"}
                                            fullWidth
                                            select
                                            {...getFieldProps("paymentMethod")}
                                            error={!!errors.paymentMethod && touched.paymentMethod}
                                            helperText={(!!errors.paymentMethod && touched.paymentMethod) && errors.paymentMethod}
                                        >
                                            {paymentMethods.map(item => (<MenuItem value={item} key={item}>{item}</MenuItem>))}
                                        </TextField>
                                    </Grid>
                                </Grid>

                                {isReceivable &&
                                    <Grid item xs={12} mt={"5px"}>
                                        <LocalizationProvider
                                            dateAdapter={AdapterDayjs}
                                            localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                                            adapterLocale='es'>
                                            <DemoContainer components={['DatePicker']}>
                                                <DatePicker
                                                    slotProps={{
                                                        field: { clearable: true },
                                                        toolbar: { hidden: true },
                                                        textField: {
                                                            size: "small",
                                                            margin: "dense",
                                                            error: !!errors.payBefore && touched.payBefore,
                                                        },
                                                    }}
                                                    label="Pagar antes de:" disablePast
                                                    onChange={(value) => {
                                                        setFieldValue("payBefore", value);
                                                    }} />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                        {!!errors.payBefore && (
                                            <Grid item xs={12} textAlign={"center"}>
                                                <FormHelperText component={"span"} sx={{ color: "#d32f2f" }}>
                                                    {errors.payBefore}
                                                </FormHelperText>
                                            </Grid>
                                        )}
                                    </Grid>
                                }
                                {isReceivable &&
                                    <Grid item xs={12} marginTop={"10px"}>
                                        <TextField
                                            label="Descripción"
                                            size={"small"}
                                            fullWidth
                                            {...getFieldProps("description")}
                                            error={!!errors.description && touched.description}
                                        />
                                        {!!errors.description && touched.description && (
                                            <Grid item xs={12} textAlign={"center"}>
                                                <FormHelperText component={"span"} sx={{ color: "#d32f2f" }}>
                                                    {errors.description}
                                                </FormHelperText>
                                            </Grid>
                                        )}
                                    </Grid>
                                }
                            </Grid>

                            <DialogActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <Button color="error" variant="outlined" onClick={() => { handleClose(); resetForm(); }}>Cerrar</Button>
                                <Button color="primary"
                                    disabled={
                                        isReceivable ?
                                            touched.paymentMethod === undefined ?
                                                !touched.paymentMethod :
                                                !!errors.products ||
                                                !!errors.paymentMethod ||
                                                !!errors.payBefore ||
                                                !!errors.description
                                            : touched.paymentMethod === undefined ?
                                                !touched.paymentMethod :
                                                !!errors.products
                                    }
                                    variant="outlined" onClick={() => { handleSell(values); resetForm(); }}
                                >Vender</Button>
                            </DialogActions>
                        </DialogContent>
                    </Dialog>)
            }
        </Formik >
    )
}

export default ProductSellForm