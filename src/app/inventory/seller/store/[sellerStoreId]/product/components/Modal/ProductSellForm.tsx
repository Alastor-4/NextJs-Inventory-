
"use client"

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormHelperText, Grid, IconButton, MenuItem, Select, TextField, Typography
} from '@mui/material';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { computeDepotPricePerUnit, notifySuccess, numberFormat } from '@/utils/generalFunctions';
import { ProductSellFormProps, productsProps } from '@/types/interfaces';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import sellerStoreProduct from '../../requests/sellerStoreProduct';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { $Enums, payment_methods_enum } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { esES } from '@mui/x-date-pickers/locales'
import { Field, FieldArray, Formik } from 'formik';
import * as Yup from "yup";
import 'dayjs/locale/es';
import { AddOutlined, IndeterminateCheckBoxOutlined, Remove, TapasTwoTone } from '@mui/icons-material';

interface Product {
    maxUnitsQuantity: number;
    unitsQuantity: number;
}

interface initialValuesProps {
    products: {
        maxUnitsQuantity: number;
        unitsQuantity: number;
    }[];
    sellPaymentMethod: {
        paymentMethod: payment_methods_enum,
        quantity: number
    }[],
    description?: string;
    payBefore?: Date;
}

const ProductSellForm = (
    { isModalOpen, storeId, setIsOpen, isReceivable,
        selectedProducts, allProductsByDepartment,
        setAllProductsByDepartment, setSelectedProducts }: ProductSellFormProps) => {

    const handleClose = () => {
        setIsOpen(false);
    };

    const createFormValues = (products: productsProps[]) => {
        const productsArray = products.map((product) =>
            ({ maxUnitsQuantity: product.depots![0].store_depots![0].product_remaining_units!, unitsQuantity: 1 })
        );

        return {
            products: productsArray,
            sellPaymentMethod: [{
                paymentMethod: payment_methods_enum.EfectivoCUP,
                quantity: 0
            }],
            description: "",
            payBefore: undefined,
        };
    }
    const [initialValues, setInitialValues] = useState<initialValuesProps>(createFormValues(selectedProducts));

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
                    sellPaymentMethod: [{ paymentMethod: 'EfectivoCUP', quantity: 0 }],
                })
            } else {
                setInitialValues({
                    products: [...productsData],
                    sellPaymentMethod: [{ paymentMethod: 'EfectivoCUP', quantity: 0 }],
                })
            }
        }
        handleOpenModal();
    }, [selectedProducts, isReceivable]);

    const sellValidationSchema = Yup.object({
        products: Yup.array().of(
            Yup.object<Product>({
                maxUnitsQuantity: Yup.number().integer("Debe ser un número entero").typeError("Debe ser un número"),
                unitsQuantity: Yup
                    .number().integer("Debe ser un número entero").typeError("Debe ser un número")
                    .required("Requerido")
                    .min(1, "Al menos 1")
                    .max(Yup.ref("maxUnitsQuantity"), "Cantidad superior a lo disponible"),
            })).required(),
        sellPaymentMethod: Yup.object().shape({
            paymentMethod: Yup.string().required('El método de pago es obligatorio').oneOf(
                [payment_methods_enum.EfectivoCUP, payment_methods_enum.TransferenciaCUP, payment_methods_enum.Otro],
                'Método de pago no válido'
            ),
            quantity: Yup.number().required('La cantidad es obligatoria').positive('La cantidad debe ser positiva'),
        })
    });

    const sellReceivableValidationSchema = Yup.object({
        products: Yup.array().of(Yup.object<Product>({
            maxUnitsQuantity: Yup.number().integer("Debe ser un número entero").typeError("Debe ser un número"),
            unitsQuantity: Yup
                .number().integer("Debe ser un número entero").typeError("Debe ser un número")
                .required("Requerido")
                .min(1, "Al menos 1")
                .max(Yup.ref("maxUnitsQuantity"), "Cantidad superior a lo disponible"),
        })).required(),
        sellPaymentMethod: Yup.object().shape({
            paymentMethod: Yup.string().required('El método de pago es obligatorio').oneOf(
                [payment_methods_enum.EfectivoCUP, payment_methods_enum.TransferenciaCUP, payment_methods_enum.Otro],
                'Método de pago no válido'
            ),
            quantity: Yup.number().required('La cantidad es obligatoria').positive('La cantidad debe ser positiva'),
        }),
        description: Yup.string().required("Especifique datos de la venta a pagar"),
        payBefore: Yup.date().required("Este dato es requerido")
    });

    const handleSell = async (values: initialValuesProps, setFieldError: any) => {
        let sellProduct: { storeDepotId: number; unitsQuantity: number, price: number }[] = [];

        values.products.forEach(({ unitsQuantity }: Product, index: number) => {
            const storeDepot = selectedProducts[index].depots![0].store_depots![0];
            sellProduct.push({
                storeDepotId: storeDepot.id,
                unitsQuantity: unitsQuantity,
                price: computeDepotPricePerUnit(storeDepot, unitsQuantity) * unitsQuantity
            });
        });

        console.log(values.sellPaymentMethod);
        let pricePaid = 0;
        values.sellPaymentMethod.forEach((paymentMethod) => pricePaid += paymentMethod.quantity);


        const totalPrice = sellProduct.reduce((accumulate, current) => accumulate + current.price, 0);
        if (pricePaid !== totalPrice) setShowError(true);
        if (pricePaid === totalPrice) console.log("sirvio");
        // setShowError(true);

        // Poner error de que tiene que ser igual

        // const paymenthMethods = values.sellPaymentMethod.map((paymentMethod, quantity) => {});
        // const sell = { paymentMethod: values.paymentMethod!, totalPrice: totalPrice };
        // const data = { sellerStoreId: storeId, sellData: sell, sellProductsData: sellProduct };

        // let sellItemResponse;
        // if (isReceivable) {
        //     const sellReceivableData = { description: values.description!, payBefore: values.payBefore! }
        //     const newData = { ...data!, sellReceivableData }
        //     sellItemResponse = await sellerStoreProduct.createSellReceivable(newData);
        // } else {
        //     sellItemResponse = await sellerStoreProduct.sellStoreDepotManual(data);
        // }

        // if (sellItemResponse) {
        //     const newDepartments = [...allProductsByDepartment!];

        //     sellProduct.forEach(sellProductItem => {
        //         for (const productsByDepartments of allProductsByDepartment!) {
        //             const departmentIndex = allProductsByDepartment!.indexOf(productsByDepartments);

        //             const productIndex = productsByDepartments.products!.findIndex((product: productsProps) => product.depots![0].store_depots![0].id === sellProductItem.storeDepotId);
        //             if (productIndex > -1) {
        //                 newDepartments[departmentIndex].products![productIndex].depots![0].store_depots![0].product_remaining_units
        //                     = allProductsByDepartment![departmentIndex].products![productIndex].depots![0].store_depots![0].product_remaining_units! - sellProductItem.unitsQuantity;
        //             }
        //         }
        //     })
        //     setAllProductsByDepartment(newDepartments);
        //     notifySuccess(isReceivable ? "Venta por cobrar registrada" : "La venta ha sido registrada");
        // }
        // setSelectedProducts([]);
        // handleClose()
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

    const paymentMethods: { code: payment_methods_enum, name: string }[] = [
        { code: "EfectivoCUP", name: "Efectivo CUP" },
        { code: "TransferenciaCUP", name: "Transferencia CUP" },
        { code: "Otro", name: "Otro" }
    ];

    const getFirstSelectOptions = (sellPaymentMethods: { paymentMethod: payment_methods_enum; quantity: number; }[]) => {
        const selectedMethods = [sellPaymentMethods[1]?.paymentMethod!, sellPaymentMethods[2]?.paymentMethod!];
        return paymentMethods.filter(({ code }) => !selectedMethods.includes(code));
    }
    const getSecondSelectOptions = (sellPaymentMethods: { paymentMethod: payment_methods_enum; quantity: number; }[]) => {
        const selectedMethods = [sellPaymentMethods[0]?.paymentMethod!, sellPaymentMethods[2]?.paymentMethod!];
        return paymentMethods.filter(({ code }) => !selectedMethods.includes(code));
    }
    const getThirdSelectOptions = (sellPaymentMethods: { paymentMethod: payment_methods_enum; quantity: number; }[]) => {
        const selectedMethods = [sellPaymentMethods[0]?.paymentMethod!, sellPaymentMethods[1]?.paymentMethod!];
        return paymentMethods.filter(({ code }) => !selectedMethods.includes(code));
    }

    const [isShow, setIsShow] = useState<boolean>(false);
    const [showLast, setShowLast] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    return (
        <Formik
            initialValues={initialValues}
            validationSchema={isReceivable ? sellReceivableValidationSchema : sellValidationSchema}
            onSubmit={() => { }}
        >
            {
                ({ values, errors, resetForm, setFieldValue, setFieldError, touched, getFieldProps }) => (
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
                        <DialogContent dividers sx={{ marginX: "-8px" }}>
                            <Grid container >
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
                                    <Grid item container xs={12} marginTop={"15px"}>
                                        <Grid item xs={7}>
                                            <TextField
                                                label="Método de pago"
                                                size={"small"}
                                                fullWidth
                                                select
                                                {...getFieldProps(`sellPaymentMethod[0].paymentMethod`)}
                                            >
                                                {getFirstSelectOptions(values.sellPaymentMethod).map(({ code, name }) => <MenuItem key={code} value={code}>{name}</MenuItem>)}
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
                                        </Grid>
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
                                    </Grid>
                                    {isShow && <Grid item container xs={12} marginTop={"15px"}>
                                        <Grid item xs={7}>
                                            <TextField
                                                label="Método de pago"
                                                size={"small"}
                                                fullWidth
                                                select
                                                {...getFieldProps(`sellPaymentMethod[1].paymentMethod`)}
                                            >
                                                {getSecondSelectOptions(values.sellPaymentMethod).map(({ code, name }) => <MenuItem key={code} value={code}>{name}</MenuItem>)}
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
                                        </Grid>
                                        <Grid item xs={1.5}>
                                            <Grid item>
                                                {values.sellPaymentMethod.length === 2 &&
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
                                    {showLast && <Grid item container xs={12} marginTop={"15px"}>
                                        <Grid item xs={7}>
                                            <TextField
                                                label="Método de pago"
                                                size={"small"}
                                                fullWidth
                                                select
                                                {...getFieldProps(`sellPaymentMethod[2].paymentMethod`)}
                                            >
                                                {getThirdSelectOptions(values.sellPaymentMethod).map(({ code, name }) => <MenuItem key={code} value={code}>{name}</MenuItem>)}
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
                                        </Grid>
                                        <Grid item xs={1.5}>
                                        </Grid>
                                    </Grid>}
                                    {showError && <Typography color={"red"}>Error la cantidad aportada debe ser igual al costo total</Typography>}
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
                                    // disabled={
                                    //     isReceivable ?
                                    //         touched.paymentMethod === undefined ?
                                    //             !touched.paymentMethod :
                                    //             !!errors.products ||
                                    //             !!errors.paymentMethod ||
                                    //             !!errors.payBefore ||
                                    //             !!errors.description
                                    //         : touched.paymentMethod === undefined ?
                                    //             !touched.paymentMethod :
                                    //             !!errors.products
                                    // }
                                    variant="outlined" onClick={() => { handleSell(values, setFieldError); resetForm(); }}
                                >Vender</Button>
                            </DialogActions>
                        </DialogContent>
                    </Dialog >)
            }
        </Formik >
    )
}

export default ProductSellForm