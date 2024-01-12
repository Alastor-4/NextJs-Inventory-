'use client'
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel,
    Grid, IconButton, InputAdornment, MenuItem, Switch, TextField
} from '@mui/material';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { ModalProductPriceProps } from '@/types/interfaces';
import { handleKeyDownWithDot } from '@/utils/handleKeyDown';
import { storeDetails } from '../../request/storeDetails';
import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from "yup";

const ModalProductPrice = ({ activeModalPrice, setActiveModalPrice, dialogTitle, storeDepot, loadData }: ModalProductPriceProps) => {
    const [activeDiscount, setActiveDiscount] = useState<boolean>(false);
    const [activePercentage, setActivePercentage] = useState<boolean>(false);
    const [newSellPrice, setNewSellPrice] = useState<number>(storeDepot?.sell_price ?? "");

    useEffect(() => {
        if (storeDepot?.price_discount_quantity || storeDepot?.price_discount_percentage) {
            setActiveDiscount(true);
        }
    }, [setActiveDiscount, storeDepot?.price_discount_percentage, storeDepot?.price_discount_quantity]);

    useEffect(() => {
        setActivePercentage(storeDepot?.price_discount_percentage ? true : false);
    }, [storeDepot?.price_discount_percentage]);

    const handleCloseModal = () => {
        setActiveModalPrice({ active: false, storeDepot: storeDepot });
    }

    const initialValues = ({
        price: newSellPrice,
        currency: storeDepot?.sell_price_unit ?? "CUP",

        discount: !activePercentage
            ? storeDepot?.price_discount_quantity ?? 0
            : storeDepot?.price_discount_percentage ?? 0,

        option: !activePercentage
            ? "$" // es el simbolo para acceder a la moneda de la propiedad currency
            : '%',
        discount_description: storeDepot?.discount_description ? storeDepot?.discount_description : ''
    })

    const validationSchema = Yup.object({
        price: Yup.number().required("Defina un precio"),
        currency: Yup.string().required("Seleccione moneda"),
        discount: activePercentage
            ? (
                Yup.number()
                    .min(0, 'Mayor que 0')
                    .max(100, 'Menor que 100')
                    .required("Defina un valor")
            )
            : (
                Yup.number()
                    .max(newSellPrice!, `Menor que precio (${newSellPrice})`)
                    .min(0, "Mayor que 0")
                    .required("Defina una valor")
            ),
        option: Yup.string(),
        discount_description: Yup.string()
    });

    const handleSubmit = async (values: any) => {
        let precioOriginal = values.price;
        let discount_quantity = null;
        let discount_percentage = null;

        if (activeDiscount) {
            if (values.option !== '%') discount_quantity = values.discount
            else discount_percentage = values.discount
        }
        const data = {
            id: storeDepot?.id,
            store_id: storeDepot?.store_id,
            depot_id: storeDepot?.depot_id,
            product_units: storeDepot?.product_units,
            product_remaining_units: storeDepot?.product_remaining_units,
            seller_profit_percentage: storeDepot?.seller_profit_percentage,
            is_active: storeDepot?.is_active,
            discount_description: values.discount_description,
            sell_price: parseFloat(precioOriginal),
            sell_price_unit: values.currency,
            seller_profit_quantity: storeDepot?.seller_profit_quantity,
            price_discount_percentage: parseFloat(discount_percentage),
            price_discount_quantity: parseFloat(discount_quantity),
        }
        const response = await storeDetails.update(storeDepot?.store_id, data);
        if (response === 200) {
            setActiveModalPrice({ active: false, storeDepot: null })
            loadData();
        }
    }

    return (
        <Dialog open={activeModalPrice} fullWidth onClose={handleCloseModal}>
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
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers >
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                    onSubmit={handleSubmit}
                >
                    {(formik) => (
                        <Form>
                            <Grid container rowSpacing={2}>
                                <Grid container item rowSpacing={3} >
                                    <Grid item xs={7} marginRight={"20px"}>
                                        <TextField
                                            label="Precio"
                                            onKeyDown={handleKeyDownWithDot}
                                            size={"small"}
                                            fullWidth
                                            autoComplete='off'
                                            {...formik.getFieldProps("price")}
                                            value={formik.values.price || ""}
                                            error={!!formik.errors.price && formik.touched.price}
                                            helperText={(formik.errors.price && formik.touched.price) && formik.errors.price}
                                            onChange={(e) => {
                                                setNewSellPrice(+e.target.value)
                                                formik.setFieldValue("price", e.target.value)
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            select
                                            size={"small"}
                                            {...formik.getFieldProps("currency")}
                                            value={formik.values.currency ?? "CUP"}
                                            error={!!formik.errors.currency && formik.touched.currency}
                                            helperText={(formik.errors.currency && formik.touched.currency) && formik.errors.currency}
                                            onChange={(e) => {
                                                storeDepot!.sell_price_unit = e.target.value;
                                                formik.setFieldValue("currency", e.target.value);
                                            }}
                                        >
                                            <MenuItem value={"CUP"} >CUP</MenuItem>
                                            <MenuItem value={"MLC"} >MLC</MenuItem>
                                            <MenuItem value={"USD"} >USD</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                                <Grid item >
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={activeDiscount}
                                                disabled={!formik.values.price}
                                                onChange={() => setActiveDiscount((e) => !e)}
                                            />
                                        }
                                        label={"Usar rebaja"}
                                    />
                                </Grid>
                                {activeDiscount &&
                                    <Grid container item rowSpacing={3} >
                                        <Grid item xs={7} marginRight={"20px"}>
                                            <TextField
                                                label="Rebaja"
                                                size={"small"}
                                                {...formik.getFieldProps("discount")}
                                                value={formik.values.discount}
                                                onKeyDown={handleKeyDownWithDot}
                                                error={!!formik.errors.discount && formik.touched.discount}
                                                helperText={(formik.errors.discount && formik.touched.discount) && formik.errors.discount}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">-</InputAdornment>
                                                }}
                                                onChange={(e) => {
                                                    activeDiscount
                                                        ? storeDepot!.price_discount_quantity! = +e.target.value
                                                        : storeDepot!.price_discount_percentage! = +e.target.value
                                                    formik.setFieldValue("discount", e.target.value)
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                select
                                                size={"small"}
                                                {...formik.getFieldProps("option")}
                                                value={formik.values.option}
                                                error={!!formik.errors.option && formik.touched.option}
                                                helperText={(formik.errors.option && formik.touched.option) && formik.errors.option}
                                                onChange={(e) => {
                                                    e.target.value === '%' ? setActivePercentage(true) : setActivePercentage(false)
                                                    formik.setFieldValue('option', e.target.value)
                                                }}
                                            >
                                                <MenuItem value={"$"} >{formik.values.currency}</MenuItem>
                                                <MenuItem value={"%"} >%</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                placeholder={"Razón de la rebaja"}
                                                size={"small"}
                                                autoComplete='off'
                                                fullWidth
                                                {...formik.getFieldProps("discount_description")}
                                                error={!!formik.errors.discount_description && !!formik.touched.discount_description}
                                                // @ts-ignore
                                                helperText={(formik.errors.discount_description && formik.touched.discount_description) && formik.errors.discount_description}
                                            />
                                        </Grid>
                                    </Grid>
                                }
                            </Grid>
                            <DialogActions sx={{ marginRight: "15px", marginTop: "20px" }}>
                                <Button color="error" variant="outlined" onClick={handleCloseModal}>Cerrar</Button>
                                <Button color="primary" disabled={!formik.values.price || !formik.values.currency} variant="outlined" type='submit'>Aceptar</Button>
                            </DialogActions>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog >
    )
}

export default ModalProductPrice