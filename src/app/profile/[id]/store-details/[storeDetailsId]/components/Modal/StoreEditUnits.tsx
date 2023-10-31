import { SwapHoriz } from '@mui/icons-material';
import { Box, Button, Card, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import * as Yup from 'yup';
import React, { useState, useEffect } from 'react'
import { storeDetails } from '../../request/storeDetails';
import { useParams } from 'next/navigation';

function StoreEditUnits(props: any) {
    const { dataRow, setActiveModalEditUnits, setActiveModalTransferUnits, loadDates } = props;

    const params = useParams();

    const [remainingUnits, setRemainingUnits] = useState(dataRow.product_remaining_units);
    const [totalUnits, setTotalUnits] = useState(dataRow.product_units);

    useEffect(() => {
        if (remainingUnits !== dataRow.product_remaining_units) {
            setRemainingUnits(dataRow.product_remaining_units)
            setTotalUnits(dataRow.product_units)
        }
    }, [dataRow, remainingUnits])


    const setValidationSchema = (
        Yup.object({

            units: Yup.number()
                .min(remainingUnits, `El minimo ingresado debe coincidir con las unidades restantes en la tienda(${remainingUnits})`)
                .required("Es obligatorio este campo")

        })
    )

    const handleSubmit = async (values: any) => {
        const data = dataRow;
        data.product_units = parseInt(values.units);

        const result = await storeDetails.update(params.id, params.storeDetailsId, data);

        if (result === 200) {
            setActiveModalEditUnits(false);
            loadDates();
        }
    }

    return (
        <>
            <Formik
                initialValues={{ units: totalUnits }}
                validationSchema={setValidationSchema}
                onSubmit={handleSubmit}
            >
                {
                    (formik: any) => (
                        <Card variant='outlined' sx={{ padding: "10px" }}>
                            <form onSubmit={formik.handleSubmit}>

                                <Typography variant='h6' >{`Unidades restantes de total: ${remainingUnits} de ${totalUnits}`}</Typography>

                                <Stack marginTop={1} rowGap={1} marginLeft={1}>

                                    <Box>
                                        {`Unidades restantes: ${remainingUnits}`}
                                        <IconButton onClick={() => setActiveModalTransferUnits(true)} >
                                            <SwapHoriz
                                                color='primary'
                                            />
                                        </IconButton>
                                    </Box>

                                    <Grid container alignItems={"center"} gap={1}>
                                        <Grid item>
                                            {`Total ingresado: `}
                                        </Grid>

                                        <Grid item >
                                            <TextField
                                                size='small'
                                                {...formik.getFieldProps("units")}
                                                value={formik.values.units}
                                                error={formik.errors.units && formik.touched.units}
                                                helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                                            //sx={{ width: "100px" }}
                                            />
                                        </Grid>

                                    </Grid>

                                </Stack>
                                <Button fullWidth type='submit' variant='contained' sx={{ marginTop: "15px" }} >Aceptar</Button>


                            </form>
                        </Card>
                    )
                }
            </Formik>

        </>
    )
}

export default StoreEditUnits
