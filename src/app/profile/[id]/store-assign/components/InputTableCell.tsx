"use client"
import React, { useState, useEffect } from 'react'
import { Button, TextField } from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import storeAssign from '@/app/profile/[id]/store-assign/requests/store-assign'
import { useParams } from 'next/navigation'

function InputTableCell({ warehouseUnits, storeUnits, storeDepot, updateDepot, depot, setProductsInputValue, defaultValue, index }) {

    const [inputValues, setInputValues] = useState(defaultValue[index].value)

    useEffect(() => {
        if (inputValues !== defaultValue[index].value) {
            defaultValue[index].value = inputValues
            setProductsInputValue(defaultValue)
        }
    }, [inputValues])

    const params = useParams();

    const setValidationSchema = (
        Yup.object({
            add_remove_units: Yup.number()
                .min(-storeUnits, `el maximo a quitar es  ${-storeUnits}`)
                .max(warehouseUnits, `el maximo a agregar es ${warehouseUnits}`)
                .required("Debe poner alguna cantidad")
        })
    )

    const handleSubmit = async () => {
        storeDepot.product_remaining_units += parseInt(inputValues);

        const result = await storeAssign.UpdateProductStore(params.id, storeDepot)

        if (result.status === 200) {

            defaultValue[index].value = '0'
            setProductsInputValue(defaultValue)

            updateDepot(-parseInt(inputValues), depot);

        }
    }

    const removeOrAdd = () => {
        if (parseInt(inputValues) > 0) return "Agregar"
        else return "Quitar"
    }

    return (
        <>

            <Formik
                initialValues={{ add_remove_units: inputValues }}
                validationSchema={setValidationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {
                    (formik) => (
                        <form onSubmit={formik.handleSubmit}>
                            <TextField
                                name='add_remove_units'
                                type='number'
                                size={"small"}
                                {...formik.getFieldProps("add_remove_units")}
                                error={formik.errors.add_remove_units && formik.touched.add_remove_units}
                                helperText={(formik.errors.add_remove_units && formik.touched.add_remove_units) && formik.errors.add_remove_units}
                                onChange={e => { setInputValues(e.target.value) }}
                            />
                            {inputValues !== '0' && <Button type='submit'>
                                {removeOrAdd()}
                            </Button>
                            }
                        </form>
                    )

                }
            </Formik>




        </>
    )
}

export default InputTableCell
