
import { SwapHoriz } from '@mui/icons-material'
import {
    Box,
    Button,
    Card,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
    CircularProgress
} from '@mui/material'
import { Formik } from 'formik'
import * as Yup from 'yup'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { storeDetails } from '../../request/storeDetails'

function TransferUnits(props: any) {
    const { nameStore, storeDepot, productId, setActiveTransferUnits, loadDates } = props;

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
    }, [dataWarehouses, setDataWarehouses])


    const maxUnits = {
        cant: (!swap)
            ? selectedWarehouseDepot?.product_total_remaining_units
            : storeDepot.product_remaining_units,

        text: `No hay esa cantidad en ${!swap
            ? 'el almacen'
            : 'la tienda'
            }`
    }

    const setValidationSchema = () => (
        Yup.object({

            units: Yup.number()
                .min(0, "No puedes pasar una cantidad negativa")
                .max(maxUnits.cant, maxUnits.text)
                .required("Campo obligatorio")

        })
    )

    const handleSubmit = async (values: any) => {

        let data: any;
        const valueUnits = parseInt(values.units)

        if (!swap) {
            data = {

                depotId: selectedWarehouseDepot.id,
                product_total_remaining_units: selectedWarehouseDepot.product_total_remaining_units - valueUnits,

                storeDepotId: storeDepot.id,
                product_remaining_units: storeDepot.product_remaining_units + valueUnits,
                product_units: storeDepot.product_units + valueUnits
            }


        } else {
            data = {

                depotId: selectedWarehouseDepot.id,
                product_total_remaining_units: selectedWarehouseDepot.product_total_remaining_units + valueUnits,

                storeDepotId: storeDepot.id,
                product_remaining_units: storeDepot.product_remaining_units - valueUnits,
                product_units: storeDepot.product_units
            }
        }

        const result = await storeDetails.updateDepotsAndStoreDepots(params.storeDetailsId, data)

        if (result === 200) {
            loadDates()
        }
        setActiveTransferUnits(false);
    }

    const selectWarehouse = (formik: any) => (

        <TextField
            name="selectedWarehouse"
            size='small'
            select
            value={formik.values.warehouseInd}
            variant='standard'
            sx={{ paddingTop: "0", '& .MuiInput-underline:before': { borderBottom: 'none' } }}

        >
            {
                dataWarehouses?.map((element: any, index: number) => (
                    <MenuItem
                        key={index}
                        value={index}
                    >{element.name}</MenuItem>
                ))
            }
        </TextField>
    )


    return (
        <>

            <Formik
                initialValues={{ units: "", warehouseInd: "0" }}
                validationSchema={setValidationSchema}
                onSubmit={handleSubmit}
            >
                {(formik: any) => (
                    <Card variant='outlined' sx={{ padding: '10px' }}>
                        <Grid container direction={'column'} rowGap={3} >

                            <Grid item container justifyContent={"space-between"}>

                                <Stack alignItems={"center"}>
                                    <Typography variant='subtitle1'  >Unidades en la tienda</Typography>
                                    <Box> {storeDepot.product_remaining_units} </Box>
                                </Stack>

                                <Stack alignItems={"center"}>
                                    <Typography variant='subtitle1'  >Unidades en el almacén</Typography>
                                    <Box> {selectedWarehouseDepot?.product_total_remaining_units} </Box>
                                </Stack>

                            </Grid>


                            <Grid item container justifyContent={"space-evenly"}>

                                <Stack spacing={1} margin={1}>

                                    <small>{`Proveedor ( ${!swap ? "Almacén" : "Tienda"}  )`}</small>

                                    <Box>{!swap ? selectWarehouse(formik) : nameStore}</Box>

                                </Stack>

                                <Grid item margin={1}>

                                    <IconButton onClick={() => setSwap(!swap)} sx={{ boxShadow: "0px 1px 2px 0px black" }}>
                                        <SwapHoriz color='primary' />
                                    </IconButton>

                                </Grid>

                                <Stack spacing={1} margin={1}>

                                    <small>{`Destinatario ( ${!swap ? "Tienda" : "Almacén"}  )`}</small>

                                    <Box>{!swap ? nameStore : selectWarehouse(formik)}</Box>

                                </Stack>

                            </Grid>


                            <form onSubmit={formik.handleSubmit}>
                                <Stack alignContent={"center"} spacing={1} paddingX={3} >

                                    <TextField
                                        label=" Trasladar unidades"
                                        {...formik.getFieldProps("units")}
                                        error={formik.errors.units && formik.touched.units}
                                        helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                                    />

                                    <Button type='submit' size='small' variant='contained' >Aceptar</Button>

                                </Stack>
                            </form>





                        </Grid>
                    </Card >
                )}
            </Formik>



        </>
    )
}

export default TransferUnits
