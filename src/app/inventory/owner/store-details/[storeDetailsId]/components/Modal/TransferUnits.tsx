
import { Button, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { transactionToStore, transactionToWarehouse } from '@/utils/generalFunctions';
import { storeDetails } from '../../request/storeDetails';
import { SwapVerticalCircle } from '@mui/icons-material';
import { TransferUnitsProps } from '@/types/interfaces';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Formik } from 'formik';
import * as Yup from 'yup';

const TransferUnits = ({ nameStore, storeDepot, productId, setActiveTransferUnits, loadData, userId }: TransferUnitsProps) => {

    const params = useParams()

    //almacena los almacenes q tengan un depósito igual al q se pide modificar
    // y tbm almacena las propiedades de esos depósitos
    const [dataWarehouses, setDataWarehouses] = useState<any>(null);

    //almacena las propiedades del depósito del almacén q se seleccionó 
    const [selectedWarehouseDepot, setSelectedWarehouseDepot] = useState<any>();

    const [swap, setSwap] = useState(false)

    useEffect(() => {
        const getDataWareHouses = async () => {
            const data = await storeDetails.getDataWarehouseDepots(params.storeDetailsId, productId)
            setDataWarehouses(data);
            setSelectedWarehouseDepot(data[0].depots[0])
        }

        if (dataWarehouses === null) {
            getDataWareHouses()
        }
    }, [dataWarehouses, setDataWarehouses, params.storeDetailsId, productId])


    const maxUnits = {
        cant: (swap)
            ? storeDepot?.product_remaining_units
            : selectedWarehouseDepot?.product_total_remaining_units,

        text: `Cantidad insuficiente en ${swap
            ? 'la tienda'
            : 'el almacén'}`
    }

    const setValidationSchema = () => (
        Yup.object({
            units: Yup.number().typeError("Debe ser un número")
                .min(0, "Cantidad positiva")
                .max(maxUnits.cant, maxUnits.text)
                .required("Este campo es obligatorio")
        })
    )

    const recordTransaction = async (direction: boolean, transferredUnits: number) => {
        const data = {
            store_depot_id: storeDepot?.id,
            units_transferred_quantity: transferredUnits,
            transfer_direction: direction ? transactionToWarehouse : transactionToStore.replace,
            created_by_id: userId
        }
        const response = await storeDetails.createTransaction(params.storeDetailsId, data)

        return response ? true : false
    }

    const handleSubmit = async (values: any) => {
        let data: any;
        const valueUnits = parseInt(values.units)

        if (!swap) {
            data = {
                depotId: selectedWarehouseDepot.id,
                product_total_remaining_units: selectedWarehouseDepot.product_total_remaining_units - valueUnits,

                storeDepotId: storeDepot?.id,
                product_remaining_units: storeDepot?.product_remaining_units! + valueUnits,
                product_units: storeDepot?.product_units! + valueUnits
            }

        } else {
            data = {
                depotId: selectedWarehouseDepot.id,
                product_total_remaining_units: selectedWarehouseDepot.product_total_remaining_units + valueUnits,

                storeDepotId: storeDepot?.id,
                product_remaining_units: storeDepot?.product_remaining_units! - valueUnits,
                product_units: storeDepot?.product_units
            }
        }

        const result = await storeDetails.updateDepotsAndStoreDepots(params.storeDetailsId, data)

        if (result === 200) {
            recordTransaction(swap, valueUnits)
            loadData()
        }
        setActiveTransferUnits(false);
    }

    const selectWarehouse = (formik: any) => (
        <TextField
            name="selectedWarehouse"
            size='small'
            select
            value={dataWarehouses !== null ? formik.values.warehouseInd : ''}
        >
            {dataWarehouses !== null
                ? (
                    dataWarehouses.map((element: any, index: number) => (
                        <MenuItem
                            key={index}
                            value={index}
                        >
                            {element.name}
                        </MenuItem>
                    ))
                )
                : <MenuItem value={0}></MenuItem>
            }
        </TextField>
    )

    return (
        <Formik
            initialValues={{ units: "", warehouseInd: "0" }}
            validationSchema={setValidationSchema}
            onSubmit={handleSubmit}
        >
            {(formik: any) => (
                <Grid container rowGap={2}>
                    <Grid container item xs={12} rowSpacing={1}>
                        <Grid container item xs={12} order={swap ? 2 : 1} justifyContent={"center"}>
                            <Typography variant='subtitle1'>Unidades en almacén: {selectedWarehouseDepot?.product_total_remaining_units}</Typography>
                        </Grid>

                        <Grid container item xs={12} order={swap ? 1 : 2} justifyContent={"center"}>
                            <Typography variant='subtitle1'>Unidades en tienda: {storeDepot?.product_remaining_units}</Typography>
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} spacing={1}>
                        <Grid container item xs={12} md={6} justifyContent={"center"}>
                            Proveedor {swap ? "Tienda" : "Almacén"}
                        </Grid>

                        <Grid container item xs={12} md={6} justifyContent={"center"}>
                            {swap ? nameStore : selectWarehouse(formik)}
                        </Grid>
                    </Grid>

                    <Grid container item xs={12} justifyContent={"center"}>
                        <IconButton onClick={() => setSwap(!swap)}>
                            <SwapVerticalCircle fontSize={"large"} />
                        </IconButton>
                    </Grid>

                    <Grid container item xs={12} spacing={1}>
                        <Grid container item xs={12} md={6} justifyContent={"center"}>
                            Destinatario {swap ? "Almacén" : "Tienda"}
                        </Grid>

                        <Grid container item xs={12} md={6} justifyContent={"center"}>
                            {swap ? selectWarehouse(formik) : nameStore}
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <form onSubmit={formik.handleSubmit}>
                            <Stack alignContent={"center"} spacing={1}>
                                <TextField
                                    label=" Trasladar unidades"
                                    {...formik.getFieldProps("units")}
                                    error={formik.errors.units && formik.touched.units}
                                    helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                                />

                                <Button type='submit' size='small' variant='contained'>Aceptar</Button>
                            </Stack>
                        </form>
                    </Grid>
                </Grid>
            )}
        </Formik>
    )
}

export default TransferUnits
