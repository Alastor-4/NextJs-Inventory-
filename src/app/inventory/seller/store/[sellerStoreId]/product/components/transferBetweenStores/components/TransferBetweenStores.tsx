import { Button, Grid, MenuItem, TextField, TextareaAutosize } from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import React, { useEffect, useState } from 'react'
import { transfer } from '../request/transfer'
import { notifySuccess } from '@/utils/generalFunctions'

interface Props {
    storeId: string
    storeDepot: any
    badItem: number
    cancelChecked: (badItem: number) => void
    loadData: () => void
}

function TransferBetweenStores({ storeId, storeDepot, badItem, cancelChecked, loadData }: Props) {

    const [storeList, setStoreList] = useState([])

    useEffect(() => {
        const getStoreList = async () => {
            const newStoreList = await transfer.getAllStores(storeId)
            if (newStoreList) {
                setStoreList(newStoreList)
            }
        }

        getStoreList()
    }, [storeId])

    const setInitialValues = {
        selectedStore: '',
        units: 1,
        text: ''
    }

    const setValidationSchema = () => (
        Yup.object({
            selectedStore: Yup.string()
                .required("Campo obligatorio"),
            units: Yup.number()
                .typeError("Solo unidades numéricas")
                .min(1, "El mínimo es 1")
                .max(storeDepot.product_remaining_units, `El máximo es ${storeDepot.product_remaining_units} `)
                .required("Campo obligatorio"),

            text: Yup.string()

        })
    )

    const handleSubmit = async (values: any) => {
        const data = {
            store_depot_id: storeDepot.id,
            units_transferred_quantity: parseInt(values.units),
            from_store_accepted: true,
            to_store_id: values.selectedStore,
            to_store_accepted: false,
            transfer_notes: values.text,
            transfer_cancelled: false
        }

        const dataStore = {
            id: storeDepot.id,
            product_remaining_units: storeDepot.product_remaining_units - values.units
        }

        let result = await transfer.updateStore(storeId, dataStore)

        if (result) {

            result = await transfer.createTransfer(storeId, data)

            if (result) {
                notifySuccess("Se realizó la transferencia")

                if (+values.units === storeDepot.product_remaining_units) cancelChecked(badItem)

                loadData()
            }
        }
    }

    return (
        <>
            <Formik
                initialValues={setInitialValues}
                validationSchema={setValidationSchema}
                onSubmit={handleSubmit}
            >
                {
                    (formik: any) => (
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={1.2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name={'selectedStore'}
                                        label={'Tienda'}
                                        {...formik.getFieldProps('selectedStore')}
                                        select
                                        size='small'
                                        error={formik.errors.selectedStore && formik.touched.selectedStore}
                                        helperText={(formik.errors.selectedStore && formik.touched.selectedStore) && formik.errors.selectedStore}
                                    >
                                        {
                                            storeList.map((store: any, index: number) => (
                                                <MenuItem key={index} value={store.id}>{store.name}</MenuItem>
                                            ))
                                        }

                                    </TextField>

                                </Grid>

                                <Grid item container alignItems={'center'}>

                                    <Grid item xs={6}>
                                        <TextField
                                            name={'units'}
                                            label={'Unidades'}
                                            {...formik.getFieldProps("units")}
                                            size='small'

                                            error={formik.errors.units && formik.touched.units}
                                            helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                                        />

                                    </Grid>

                                    <Grid item marginX={'auto'}  >
                                        <Button
                                            type='submit'
                                            variant='contained'
                                            size='small'
                                            disabled={(formik.errors?.units || formik.errors?.selectedStore) ? true : false}
                                        >
                                            Aceptar
                                        </Button>
                                    </Grid>

                                </Grid>


                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name={"text"}
                                        label={'Mensaje'}
                                        multiline
                                        rows={4}
                                        {...formik.getFieldProps('text')}
                                    />

                                </Grid>

                            </Grid>
                        </form>

                    )


                }
            </Formik>
        </>
    )
}

export default TransferBetweenStores
