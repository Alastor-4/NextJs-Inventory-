"use client"
import { Button, Card, Grid, MenuItem, TextField } from '@mui/material';
import { StoreEditSellerProfitProps } from '@/types/interfaces';
import { storeDetails } from '../../request/storeDetails';
import React, { useState } from 'react'
import { Formik } from 'formik'
import * as Yup from 'yup'

export const StoreEditSellerProfit = ({ storeDepot, setActiveModalSellerProfit, loadData }: StoreEditSellerProfitProps) => {
    const [selectedButton, setSelectedButton] = useState(storeDepot?.seller_profit_percentage !== null ? false : true)

    const initialValues = ({
        percentage: !selectedButton ? storeDepot?.seller_profit_percentage ?? "0" : "0",
        quantity: selectedButton ? storeDepot?.seller_profit_quantity ?? "0" : "0",
    });
    const setValidationSchema = () => (
        Yup.object({
            percentage: Yup.number()
                .min(0, "El limite inferior es 0")
                .max(100, "El limite superior es 100")
                .required("Campo requerido"),
            quantity: Yup.number()
                .min(0, "El limite inferior es 0")
                .max(parseFloat(`${storeDepot?.sell_price!}`), `El limite superior es ${storeDepot?.sell_price}`)
                .required("Campo requerido")
        })
    )

    const handleSubmit = async (values: any) => {
        const data = {
            id: storeDepot?.id,
            store_id: storeDepot?.store_id,
            depot_id: storeDepot?.depot_id,
            product_units: storeDepot?.product_units,
            product_remaining_units: storeDepot?.product_remaining_units,
            seller_profit_percentage: (!selectedButton) ? parseFloat(values.percentage) : null,
            is_active: storeDepot?.is_active,
            sell_price: parseFloat(`${storeDepot?.sell_price!}`),
            sell_price_unit: storeDepot?.sell_price_unit,
            seller_profit_quantity: (selectedButton) ? parseFloat(values.quantity) : null,
            price_discount_percentage: storeDepot?.price_discount_percentage,
            price_discount_quantity: storeDepot?.price_discount_quantity,
        }

        const request = await storeDetails.update(storeDepot?.id, data);
        if (request === 200) {
            setActiveModalSellerProfit(false)
            loadData()
        }
    }

    const editPercentage = (formik: any) => (
        <>
            <Grid container gap={1}>
                <TextField
                    name='percentage'
                    label="Porciento"
                    {...formik.getFieldProps("percentage")}
                    value={formik.values.percentage ?? ""}
                    error={formik.errors.percentage && formik.touched.percentage}
                    helperText={(formik.errors.percentage && formik.touched.percentage) && formik.errors.percentage}
                />
                <TextField
                    name={"symbolPercentage"}
                    select
                    value={'%'}
                >
                    <MenuItem value={"%"}>%</MenuItem>
                </TextField>
            </Grid>
        </>
    )


    const editQuantity = (formik: any) => (
        <>
            <Grid container gap={1}>
                <TextField
                    name='quantity'
                    label="Cantidad fija"
                    {...formik.getFieldProps("quantity")}
                    value={formik.values.quantity ?? ""}
                    error={formik.errors.quantity && formik.touched.quantity}
                    helperText={(formik.errors.quantity && formik.touched.quantity) && formik.errors.quantity}
                />
                <TextField
                    name={"currency"}
                    select
                    value={storeDepot?.sell_price_unit}
                >
                    <MenuItem value={storeDepot?.sell_price_unit!}>CUP</MenuItem>
                </TextField>
            </Grid>
        </>
    )

    return (
        <>
            <Formik
                initialValues={initialValues}
                validationSchema={setValidationSchema()}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {(formik) => (
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container direction={'column'} rowSpacing={2} >
                            <Grid item container columnSpacing={1}>
                                <Grid item xs={6}>
                                    <Button
                                        variant={!selectedButton ? "outlined" : "text"}
                                        onClick={() => setSelectedButton(false)}
                                    >Porciento</Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        variant={selectedButton ? "outlined" : "text"}
                                        onClick={() => setSelectedButton(true)}
                                    >Cantidad</Button>
                                </Grid>
                            </Grid>
                            <Grid item container >
                                <Card variant="outlined" sx={{ padding: "10px" }}>
                                    <Grid item container direction={'column'}>
                                        {!selectedButton
                                            ? editPercentage(formik)
                                            : editQuantity(formik)
                                        }
                                        <Grid item >
                                            <Button type='submit'>Guardar cambios</Button>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </>
    )
}


export default StoreEditSellerProfit
