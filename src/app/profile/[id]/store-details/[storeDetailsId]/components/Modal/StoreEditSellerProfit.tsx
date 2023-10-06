"use client"
import { Formik } from 'formik'
import * as Yup from 'yup'
import React, { useState } from 'react'
import { Button, Card, Grid, MenuItem, TextField } from '@mui/material';
import { storeDetails } from '../../request/storeDetails';



function StoreEditSellerProfit({ userId, storeDepot, setActiveModalSellerProfit, loadDates }) {
console.log(storeDepot)
    const [selectedButton, setSelectedButton] = useState(storeDepot.seller_profit_percentage !== null ? false : true)

    const initialValues = ({
        percentage: storeDepot.seller_profit_percentage ?? "0",
        quantity: storeDepot.seller_profit_quantity ?? "0",
    });
    const setValidationSchema = () => (
        Yup.object({
            percentage: Yup.number()
                .min(0, "El limite inferior es 0")
                .max(100, "El limite superior es 100")
                .required("Campo requerido"),

            quantity: Yup.number()
                .min(0, "El limite inferior es 0")
                .max(storeDepot.sell_price, `El limite superior es ${storeDepot.sell_price}`)
                .required("Campo requerido")

        })
    )

    const handleSubmit = async (values) => {

        const data = {
            id: storeDepot.id,
            store_id: storeDepot.store_id,
            depot_id: storeDepot.depot_id,
            product_units: storeDepot.product_units,
            product_remaining_units: storeDepot.product_remaining_units,
            seller_profit_percentage: (!selectedButton) ? parseFloat(values.percentage) : null,
            is_active: storeDepot.is_active,
            offer_notes: storeDepot.offer_notes,
            sell_price: storeDepot.sell_price,
            sell_price_unit: storeDepot.sell_price_unit,
            seller_profit_quantity: (selectedButton) ? parseFloat(values.quantity) : null,
            price_discount_percentage: storeDepot.price_discount_percentage,
            price_discount_quantity: storeDepot.price_discount_quantity,
        }

        const request = await storeDetails.update(userId, storeDepot.id, data);
        if( request === 200){
            setActiveModalSellerProfit(false)
            loadDates()
        }

    }

    const editPercentage = (formik) => (
        <>
            <Grid container gap={1}>

                <TextField
                    name='percentage'
                    label="Porcentaje"
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
                    <MenuItem value={"%"} >%</MenuItem>
                </TextField>
            </Grid>
        </>
    )

    const editQuantity = (formik) => (
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
                    value={storeDepot.sell_price_unit}
                >
                    <MenuItem value={storeDepot.sell_price_unit} >{storeDepot.sell_price_unit}</MenuItem>
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
                        <Card variant='outlined' sx={{ padding: '10px' }} >
                            <Grid container direction={'column'} rowSpacing={2} >

                                <Grid item container columnSpacing={1}>

                                    <Grid item>
                                        <Button
                                            variant={!selectedButton ? "contained" : "outlined"}
                                            onClick={() => setSelectedButton(false)}
                                        >Porcentaje</Button>
                                    </Grid>

                                    <Grid item>
                                        <Button
                                            variant={selectedButton ? "contained" : "outlined"}
                                            onClick={() => setSelectedButton(true)}
                                        >Cantidad fija</Button>
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
                        </Card>
                    </form>
                )}
            </Formik>
        </>
    )
}


export default StoreEditSellerProfit
