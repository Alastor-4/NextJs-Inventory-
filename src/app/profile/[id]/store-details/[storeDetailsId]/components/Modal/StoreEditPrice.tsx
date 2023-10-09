"use client"
import { Button, Card, Grid, MenuItem, Switch, TextField, Typography } from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import React, { useEffect, useState } from 'react'
import { storeDetails } from '../../request/storeDetails'

function StoreEditPrice({ userId, storeDepot, setActiveModalPrice, loadDates }) {

    const [activeDiscount, setActiveDiscount] = useState(false)
    const [activePercentage, setActivePercentage] = useState(false)
    const [newSellPrice, setNewSellPrice] = useState(storeDepot.sell_price);

    useEffect(() => {
        if (storeDepot.price_discount_quantity || storeDepot.price_discount_percentage) {
            setActiveDiscount(true)
        }
    }, [setActiveDiscount])

    useEffect( () => {
        setActivePercentage( storeDepot.price_discount_percentage ? true : false ) 
    },[setActivePercentage])

    const initialValues = ({
        price: newSellPrice,
        currency: storeDepot.sell_price_unit ?? "CUP",

        discount: !activePercentage
         ? storeDepot.price_discount_quantity ?? newSellPrice
         : storeDepot.price_discount_percentage ?? 100,
         
          option: !activePercentage 
                 ? storeDepot.sell_price_units ?? "CUP"
                 : '%'
    })
    
    const setValidationSchema = () => (
        Yup.object({

            price: Yup.number()
                .min(0, "No se admiten precios negativos")
                .required("Debe definir un precio"),

            currency: Yup.string().required("Debes poner alguna moneda"),

            discount: !activePercentage
             ? (
                Yup.number()
                .max(newSellPrice, `La rebaja no puede ser mayor al precio original (${newSellPrice})`)
                .min(0, "No se admiten precios negativos")
                .required("Defina una rebaja")
             )
             :  ( 
                Yup.number()
                .min(0, 'El limite inferior es 0')
                .max(100, 'El limite superior es 100')
                .required("Defina un porcentaje")
             ),

            option: Yup.string()

        })
    )

    const handleSubmit = async (values) => {
        let precioOriginal = values.price;
        let discount_quantity = null;
        let discount_percentage = null;

        if (activeDiscount) {
            if (values.option !== '%') discount_quantity = values.discount
            else discount_percentage = values.discount
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
                    onChange={(e) => { 
                        setNewSellPrice(e.target.value) 
                       formik.setFieldValue( "price", e.target.value )
                    }}
                />

                <TextField
                    name={"currency"}
                    select
                    {...formik.getFieldProps("currency")}
                    value={formik.values.currency ?? "CUP"}
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
                            <TextField
                                name='discount'
                                label="Rebaja"
                                {...formik.getFieldProps("discount")}
                                value={formik.values.discount}
                                error={formik.errors.discount && formik.touched.discount}
                                helperText={(formik.errors.discount && formik.touched.discount) && formik.errors.discount}
                                onChange={ (e) => {
                                    activeDiscount
                                    ? storeDepot.price_discount_quantity = e.target.value
                                    : storeDepot.price_discount_percentage = e.target.value
                               
                                    formik.setFieldValue("discount",e.target.value)
                                } }
                            />


                    <TextField
                        name={"option"}
                        select
                        {...formik.getFieldProps("option")}
                        value={formik.values.option = (formik.values.option !== '%') ? formik.values.currency : '%'}
                        error={formik.errors.option && formik.touched.option}
                        helperText={(formik.errors.option && formik.touched.option) && formik.errors.option}
                        onChange={(e) => {
                            e.target.value === '%' ? setActivePercentage(true) : setActivePercentage(false)
                            formik.setFieldValue('option',e.target.value)
                        }}
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
                                    {Original(formik)}

                                    <Grid item >
                                        <Switch
                                            checked={activeDiscount}
                                            onChange={() => setActiveDiscount((e) => !e)}
                                        /> Activar rebaja
                                    </Grid>

                                    {activeDiscount && Rebaja(formik)}


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
