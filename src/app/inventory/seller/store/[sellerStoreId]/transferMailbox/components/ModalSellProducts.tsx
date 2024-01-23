//@ts-nocheck
import {
    AppBar,
    Button,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import { CloseIcon } from "next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon";
import React, { useState } from "react";
import { DataTransferReceived, TransferStoreDepots } from "./TypeTransfers";
import { Formik } from "formik";
import * as Yup from 'yup'
import { computeDepotPricePerUnit, notifySuccess, numberFormat } from "@/utils/generalFunctions";
import transfer from "../request/transfer";

interface ModalSellProductsProps {
    storeId: number
    dialogTitle: string,
    open: boolean,
    setOpen: (bool: boolean) => void
    storeDepot: TransferStoreDepots
    dataItem: DataTransferReceived
    handleAccept: (units: number) => void
}

export default function ModalSellProducts({ storeId, dialogTitle, open, setOpen, storeDepot, dataItem, handleAccept }: ModalSellProductsProps) {
    const handleClose = () => {
        setOpen(false);
    };

    const SellProductForm = () => {
        const [totalPrice, setTotalPrice] = useState(parseInt(storeDepot.sell_price))
        const [productOffer, setProductOffer] = useState<string>("-")

        const paymentMethods = ["Efectivo CUP", "Transferencia CUP", "Otro"]

        const defaultValues = () => {
            setTotalPrice(0)
            setProductOffer("-")
        }

        const findOffer = (units: number) => {
            let result = '-'

            storeDepot.product_offers.forEach((element) => {
                if (element.is_active) {
                    if (element.compare_function === "=") {
                        if (element.compare_units_quantity === units)
                            result = `Cuando compren ${element.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${element.price_per_unit} ${storeDepot.sell_price_unit}`
                    } else {
                        if (element.compare_units_quantity < units)
                            result = `Cuando compren más de ${element.compare_units_quantity} unidades de este producto, cada unidad tendrá un precio de ${element.price_per_unit} ${storeDepot.sell_price_unit}`
                    }
                }
            })
            return result
        }

        const getTotal = (units: string) => {
            const compareUnits = parseInt(units)
            const newTotalPrice = computeDepotPricePerUnit(storeDepot, compareUnits) * compareUnits
            setTotalPrice(
                numberFormat(newTotalPrice.toString())
            )

            setProductOffer(
                findOffer(compareUnits)
            )
        }

        const setValidationSchema = () => (
            Yup.object({
                units: Yup.number()
                    .typeError("Solo valor numérico")
                    .integer("Solo valores sin coma")
                    .min(1, "Mínimo 1 unidad")
                    .max(dataItem.units_transferred_quantity, `Máximo ${dataItem.units_transferred_quantity} unidades`)
                    .required("Campo requerido"),
                paymentMethod: Yup.string().required("Campo requerido"),
            })
        )
        const handleSubmit = async (values: { units: string, paymentMethod: string }) => {
            const units = parseInt(values.units)
            const data = {
                total_price: totalPrice,
                payment_method: values.paymentMethod,
                store_depot_id: storeDepot.id,
                units_quantity: units,
                price: parseInt(computeDepotPricePerUnit(storeDepot, units))
            }

            const result = await transfer.createSells(storeId!, data)

            if (result) {
                handleAccept(dataItem.units_transferred_quantity - units)

                notifySuccess("Se completó la venta")
            }
        }

        return (
            <Formik
                initialValues={{ units: "1", paymentMethod: '' }}
                validationSchema={setValidationSchema}
                onSubmit={handleSubmit}
            >
                {
                    (formik) => {
                        const discountPercentage = storeDepot.price_discount_percentage
                        const discountQuantity = (
                            storeDepot.price_discount_quantity
                                ? storeDepot.price_discount_quantity * 100 / parseInt(storeDepot.sell_price)
                                : null
                        )
                        const discount = (
                            discountPercentage
                                ? `${discountPercentage}%`
                                : discountQuantity
                                    ? `${discountQuantity}%`
                                    : "-"
                        )
                        return (
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container rowSpacing={2}>

                                    <Grid item marginX={'auto'}>Unidades</Grid>

                                    <Grid item marginX={'auto'}>Precio</Grid>

                                    <Grid item container spacing={1}>

                                        <Grid item container justifyContent={'center'} >
                                            <Grid item xs={6} sx={{ padding: '0 10%' }} >
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    {...formik.getFieldProps("units")}
                                                    error={Boolean(formik.errors.units && formik.touched.units)}
                                                    helperText={Boolean((formik.errors.units && formik.touched.units)) && formik.errors.units}
                                                    onChange={async (e) => {
                                                        const error = await formik.setFieldValue('units', e.target.value)
                                                        !error?.units
                                                            ? getTotal(e.target.value)
                                                            : defaultValues()
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item margin={'auto'}>
                                                {`${totalPrice} `}
                                                <small>{storeDepot.sell_price_unit}</small>
                                            </Grid>

                                        </Grid>

                                    </Grid>

                                    <Grid item container rowSpacing={1} fontSize={14} paddingX={2}>

                                        <Grid item container spacing={1}>
                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Rebaja:</Grid>
                                            <Grid item>{discount}</Grid>
                                        </Grid>

                                        <Grid item container columnGap={1} >
                                            <Grid item xs={"auto"} sx={{ fontWeight: 600 }}>Oferta:</Grid>
                                            <Grid item
                                                alignSelf={'center'}
                                                sx={
                                                    productOffer !== '-'
                                                        ? {
                                                            width: 'fit-content',
                                                            backgroundColor: "lightgray",
                                                            padding: "2px 4px",
                                                            borderRadius: "5px 2px 2px 2px",
                                                            border: "1px solid",
                                                            fontSize: 14,
                                                        }
                                                        : {}
                                                }
                                            >{productOffer}</Grid>
                                        </Grid>

                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Método de pago"
                                            size={"small"}
                                            fullWidth
                                            select
                                            {...formik.getFieldProps("paymentMethod")}
                                            error={Boolean(formik.errors.paymentMethod && formik.touched.paymentMethod)}
                                            helperText={(formik.errors.paymentMethod && formik.touched.paymentMethod) && formik.errors.paymentMethod}
                                        >
                                            {
                                                paymentMethods.map(item => (<MenuItem value={item} key={item}>{item}</MenuItem>))
                                            }
                                        </TextField>
                                    </Grid>

                                    <Grid item xs={12} paddingX={8}>
                                        <Button
                                            fullWidth
                                            type={'submit'}
                                            variant="contained"
                                        >
                                            Aceptar
                                        </Button>
                                    </Grid>


                                </Grid>
                            </form>
                        )

                    }

                }

            </Formik>
        )
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {dialogTitle}
                    </Typography>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <DialogContent>
                <SellProductForm />
            </DialogContent>
        </Dialog>
    )
}