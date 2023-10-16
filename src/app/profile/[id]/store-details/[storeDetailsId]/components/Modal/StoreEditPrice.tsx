"use client"
import { Button, Card, Grid, MenuItem, Switch, TextField, Typography } from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import React, { useEffect, useState } from 'react'
import { storeDetails } from '../../request/storeDetails'

function StoreEditPrice({ userId, storeDepot, setActiveModalPrice, loadDates }) {

    const [activeDiscount, setActiveDiscount] = useState(false)

    useEffect(() => {
        if (storeDepot.price_discount_quantity || storeDepot.price_discount_percentage) {
            setActiveDiscount(true)
        }
    }, [setActiveDiscount, storeDepot.price_discount_percentage, storeDepot.price_discount_quantity])

    const initialValues = ({
        price: storeDepot.sell_price,
        currency: storeDepot.sell_price_unit,
        discount: storeDepot.price_discount_quantity ?? storeDepot.sell_price,
        percentage: storeDepot.price_discount_percentage ?? 100,
        option: storeDepot.price_discount_percentage !== null ? '%' : '',
    })

    const setValidationSchema = () => (
        Yup.object({
            price: Yup.number()
            .min(0,"No se admiten precios negativos")
            .required("El precio no puede estar vacio"),
            
            currency: Yup.string().required("Debes poner alguna moneda"),
            
            discount: Yup.number()
            .max(storeDepot.sell_price,`La rebaja no puede ser mayor al precio original (${storeDepot.sell_price})`)
            .min(0,"NO se admiten precios negativos")
            .required("Campo obligatorio"),

            percentage: Yup.number()
                .min(0, 'El limite inferior es 0')
                .max(100, 'El limite superior es 100')
                .required("Campo obligatorio"),

            option: Yup.string()

        })
    )

    const handleSubmit = async (values) => {
        let precioOriginal = values.price;
        let discount_quantity = null;
        let discount_percentage = null;

        if (activeDiscount) {
            precioOriginal = storeDepot.sell_price;

            if (values.option !== '%') discount_quantity = values.discount
            else discount_percentage = values.percentage
        }

        const data = {
            id: storeDepot.id,
            store_id: storeDepot.store_id,
            depot_id: storeDepot.depot_id,
            product_units: storeDepot.product_units,
            product_remaining_units: storeDepot.product_remaining_units,
            seller_profit_percentage: storeDepot.seller_profit_percentage,
            is_active: storeDepot.is_active,
            offer_notes: storeDepot.offer_notes,
            sell_price: parseFloat(precioOriginal),
            sell_price_unit: values.currency,
            seller_profit_quantity: storeDepot.seller_profit_quantity,
            price_discount_percentage: parseFloat(discount_percentage),
            price_discount_quantity: parseFloat(discount_quantity),

        }

        const response = await storeDetails.update(userId, storeDepot.store_id, data)

        if (response === 200) {
            setActiveModalPrice({ active: false, storeDepot: [] })
            loadDates();
        }
    }

    const Original = (formik) => (
        <>
            <Grid container gap={1}>

                <TextField
                    name='price'
                    label="Precio"
                    {...formik.getFieldProps("price")}
                    value={formik.values.price || ""}
                    error={formik.errors.price && formik.touched.price}
                    helperText={(formik.errors.price && formik.touched.price) && formik.errors.price}

                />

                <TextField
                    name={"currency"}
                    select
                    {...formik.getFieldProps("currency")}
                    value={formik.values.currency || "CUP"}
                    error={formik.errors.currency && formik.touched.currency}
                    helperText={(formik.errors.currency && formik.touched.currency) && formik.errors.currency}
                >
                    <MenuItem value={"CUP"} >CUP</MenuItem>
                    <MenuItem value={"MLC"} >MLC</MenuItem>
                    <MenuItem value={"USD"} >USD</MenuItem>

                </TextField>
            </Grid>
        </>
    )

    const Rebaja = (formik) => (
        <>
            <Grid item container gap={1} direction={'column'}>

                <Grid item container columnGap={1} >
                    {formik.values.option !== '%'
                        ? (
                            <TextField
                                name='discount'
                                label="Rebaja"
                                {...formik.getFieldProps("discount")}
                                value={formik.values.discount}
                                error={formik.errors.discount && formik.touched.discount}
                                helperText={(formik.errors.discount && formik.touched.discount) && formik.errors.discount}

                            />
                        )
                        : (
                            <TextField
                                name='percentage'
                                label="Rebaja"
                                {...formik.getFieldProps("percentage")}
                                value={formik.values.percentage}
                                error={formik.errors.percentage && formik.touched.percentage}
                                helperText={(formik.errors.percentage && formik.touched.percentage) && formik.errors.percentage}

                            />

                        )

                    }


                    <TextField
                        name={"option"}
                        select
                        {...formik.getFieldProps("option")}
                        value={formik.values.option = (formik.values.option !== '%') ? formik.values.currency : '%'}
                        error={formik.errors.option && formik.touched.option}
                        helperText={(formik.errors.option && formik.touched.option) && formik.errors.option}
                    >
                        <MenuItem value={formik.values.currency} >{formik.values.currency}</MenuItem>
                        <MenuItem value={"%"} >%</MenuItem>


                    </TextField>

                </Grid>
            </Grid>
        </>
    )

    return (
        <div>
            <Formik
                initialValues={initialValues}
                validationSchema={setValidationSchema()}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {(formik) => (

                    <form onSubmit={formik.handleSubmit}>
                        <Card variant='outlined' sx={{ padding: '10px' }} >
                            <Grid container direction={'column'} >
                                <Grid item container gap={2} direction={'column'}>

                                    {activeDiscount
                                        ? Rebaja(formik)
                                        : Original(formik)
                                    }


                                    <Grid item >
                                        <Switch
                                            checked={activeDiscount}
                                            onChange={() => setActiveDiscount((e) => !e)}
                                        /> Activar rebaja
                                    </Grid>

                                    <Grid item >
                                        <Button type='submit'>Guardar cambios</Button>
                                    </Grid>
                                </Grid>

                            </Grid>
                        </Card>
                    </form>
                )}
            </Formik>
        </div>
    )
}

export default StoreEditPrice
