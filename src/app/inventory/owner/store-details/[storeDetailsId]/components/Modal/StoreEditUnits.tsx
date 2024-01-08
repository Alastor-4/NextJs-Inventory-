import { Button, Grid, TextField, Typography } from '@mui/material';
import { storeDetails } from '../../request/storeDetails';
import { StoreEditUnitsProps } from '@/types/interfaces';
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation';
import { Formik } from 'formik';
import * as Yup from 'yup';

export const StoreEditUnits = ({ dataRow, setActiveModalEditUnits, loadData, }: StoreEditUnitsProps) => {

    const params = useParams();

    const [remainingUnits, setRemainingUnits] = useState<number | null>(dataRow?.product_remaining_units!);
    const [totalUnits, setTotalUnits] = useState<number | null>(dataRow?.product_units!);

    useEffect(() => {
        if (remainingUnits !== dataRow?.product_remaining_units!) {
            setRemainingUnits(dataRow?.product_remaining_units!)
            setTotalUnits(dataRow?.product_units!)
        }
    }, [dataRow, remainingUnits])

    const setValidationSchema = (
        Yup.object({
            units: Yup.number()
                .min(remainingUnits!, `valor mayor que las unidades restantes en la tienda (${remainingUnits})`)
                .required("valor requerido")
        })
    )

    const handleSubmit = async (values: any) => {
        const data = dataRow!;
        data.product_units = +values.units;

        const result = await storeDetails.update(params.storeDetailsId, data!);

        if (result === 200) {
            setActiveModalEditUnits(false);
            loadData();
        }
    }

    return (
        <Formik
            initialValues={{ units: totalUnits }}
            validationSchema={setValidationSchema}
            onSubmit={handleSubmit}
        >
            {
                (formik: any) => (
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container rowSpacing={2}>
                            <Grid item xs={12}>
                                <Typography variant='subtitle1'>
                                    Unidades transferidas a la tienda: {totalUnits}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant='subtitle1'>
                                    Unidades restante en la tienda: {remainingUnits}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    size='small'
                                    label={"Modificar total ingresado a la tienda"}
                                    fullWidth
                                    {...formik.getFieldProps("units")}
                                    value={formik.values.units}
                                    error={formik.errors.units && formik.touched.units}
                                    helperText={(formik.errors.units && formik.touched.units) && formik.errors.units}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button fullWidth type='submit' variant='contained' sx={{ marginTop: "15px" }}>
                                    Aceptar
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )
            }
        </Formik>
    )
}

export default StoreEditUnits
